import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import MainHeading from '@/components/layout/MainHeading'
import EmptySearchState from '@/components/page/CarianDokumen/EmptySearchState'
import SearchLoadingState from '@/components/page/CarianDokumen/SearchLoadingState'
import SearchBarCarianDokumen from '@/components/page/CarianDokumen/SearchBarCarianDokumen'
import DisplaySearchResults from '@/components/page/CarianDokumen/DisplaySearchResults'
import SelectCarianDokumenWithStore from '@/components/page/CarianDokumen/SelectCarianDokumenWithStore'
import { getSearchRecordCarianDokumen } from '@/services/catalog.svc'
import { getHybridSearchItemKey, postHybridSearch } from '@/services/search.svc'
import { getDropdownJenisDokumen, getDropdownUnits } from '@/services/dropdown.svc'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSearchStore } from '@/store/SearchStore'
import { AutoToast } from '@govtechmy/myds-react/toast'

export interface DocumentRecord {
  documentId: string
  title: string
}

export interface KeywordRecord {
  keyword: string
  documentID: string
  dataPage: Record<string, number>[]
}

export interface BackendSearchResponse {
  data: {
    keyword: string
    document: DocumentRecord[]
  }
}

export interface DocumentInfoResponse {
  data: {
    documentID: string
    path: string
  }
}

const LAZY_BATCH_SIZE = 10
const APPEND_LOAD_COOLDOWN_MS = 300

export default function CarianDokumenPage() {
  const [searchParams] = useSearchParams()
  const latestSearchRequestTokenRef = useRef(0)
  const hadSearchQueryRef = useRef(false)
  const appendRequestInFlightRef = useRef(false)
  const lastAppendTriggerAtRef = useRef(0)
  const currentPageRef = useRef(1)

  const query = useSearchStore((state) => state.query)
  const jenisCarian = useSearchStore((state) => state.jenisCarian)
  const jenisDokumen = useSearchStore((state) => state.jenisDokumen)
  const unit = useSearchStore((state) => state.unit)
  const dateFrom = useSearchStore((state) => state.dateFrom)
  const dateTo = useSearchStore((state) => state.dateTo)
  const sort = useSearchStore((state) => state.sort)
  const isLoadingSearch = useSearchStore((state) => state.isLoadingSearch)
  const documentRecords = useSearchStore((state) => state.documentRecords)
  const hybridRecords = useSearchStore((state) => state.hybridRecords)
  const searchMeta = useSearchStore((state) => state.searchMeta)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const setFromSearchParams = useSearchStore((state) => state.setFromSearchParams)
  const setIsLoadingSearch = useSearchStore((state) => state.setIsLoadingSearch)
  const setDocumentRecords = useSearchStore((state) => state.setDocumentRecords)
  const setHybridRecords = useSearchStore((state) => state.setHybridRecords)
  const setSelectedHybridKey = useSearchStore((state) => state.setSelectedHybridKey)
  const setDocumentInfo = useSearchStore((state) => state.setDocumentInfo)
  const setSelectedDocumentId = useSearchStore((state) => state.setSelectedDocumentId)
  const setSelectedKeywordId = useSearchStore((state) => state.setSelectedKeywordId)
  const setSearchMeta = useSearchStore((state) => state.setSearchMeta)
  const setDropdownUnits = useSearchStore((state) => state.setDropdownUnits)
  const setDropdownJenisDokumen = useSearchStore((state) => state.setDropdownJenisDokumen)
  const resetSearchState = useSearchStore((state) => state.resetSearchState)
  const fetchDocumentInfo = useSearchStore((state) => state.fetchDocumentInfo)

  const fetchAndSetDocumentRecords = useCallback(
    async (options?: { append?: boolean }) => {
      const append = options?.append ?? false
      const nextPage = append ? currentPageRef.current + 1 : 1
      const requestToken = ++latestSearchRequestTokenRef.current

      if (append) {
        setIsLoadingMore(true)
      } else {
        setSelectedKeywordId(null)
        setIsLoadingSearch(true)
      }

      try {
        if (jenisCarian === 'hybrid') {
          const hybridResponse = await postHybridSearch({
            query,
            page: nextPage,
            limit: LAZY_BATCH_SIZE,
          })

          if (requestToken !== latestSearchRequestTokenRef.current) {
            return
          }

          currentPageRef.current = hybridResponse.meta.currentPage || nextPage
          setSearchMeta(hybridResponse.meta)

          if (append) {
            const currentRecords = useSearchStore.getState().hybridRecords
            setHybridRecords([...currentRecords, ...hybridResponse.items])
            return
          }

          setDocumentRecords([])
          setHybridRecords(hybridResponse.items)

          const firstItem = hybridResponse.items[0]
          if (firstItem) {
            setSelectedHybridKey(getHybridSearchItemKey(firstItem))
            setSelectedDocumentId(firstItem.record_id)
            await Promise.allSettled([fetchDocumentInfo(firstItem.record_id)])
          } else {
            setSelectedHybridKey(null)
            setSelectedDocumentId(null)
            setDocumentInfo(null)
          }
          return
        }

        const backendResponse = await getSearchRecordCarianDokumen({
          query,
          unit,
          jenisDokumen,
          dateFrom,
          dateTo,
          sort,
          page: nextPage,
          limit: LAZY_BATCH_SIZE,
        })

        if (requestToken !== latestSearchRequestTokenRef.current) {
          return
        }

        currentPageRef.current = backendResponse.meta.currentPage || nextPage
        setSearchMeta(backendResponse.meta)

        const documents = backendResponse.items.map((item) => ({
          documentId: item.recordId,
          title: item.title,
          recordDate: item.recordDate,
          documentProfileName: item.documentProfileName,
          fileExtension: item.fileExtension,
        }))

        if (append) {
          const currentRecords = useSearchStore.getState().documentRecords
          setDocumentRecords([...currentRecords, ...documents])
          return
        }

        setHybridRecords([])
        setSelectedHybridKey(null)
        setDocumentRecords(documents)

        if (documents.length > 0) {
          setSelectedDocumentId(documents[0].documentId)
          await Promise.allSettled([fetchDocumentInfo(documents[0].documentId)])
        } else {
          setSelectedDocumentId(null)
          setDocumentInfo(null)
        }
      } catch (error) {
        if (requestToken !== latestSearchRequestTokenRef.current) {
          return
        }

        console.error('Search error:', error)
        if (!append) {
          setDocumentRecords([])
          setHybridRecords([])
          setSelectedHybridKey(null)
          setSearchMeta(null)
        }
      } finally {
        if (append) {
          setIsLoadingMore(false)
        }

        if (!append && requestToken === latestSearchRequestTokenRef.current) {
          setIsLoadingSearch(false)
        }
      }
    },
    [
      dateFrom,
      dateTo,
      fetchDocumentInfo,
      jenisCarian,
      jenisDokumen,
      query,
      sort,
      setDocumentInfo,
      setDocumentRecords,
      setHybridRecords,
      setIsLoadingSearch,
      setSearchMeta,
      setSelectedDocumentId,
      setSelectedHybridKey,
      setSelectedKeywordId,
      unit,
    ]
  )

  const triggerAppendLoad = useCallback(() => {
    const now = Date.now()

    if (
      !searchMeta?.hasNextPage ||
      isLoadingSearch ||
      isLoadingMore ||
      appendRequestInFlightRef.current ||
      now - lastAppendTriggerAtRef.current < APPEND_LOAD_COOLDOWN_MS
    ) {
      return
    }

    lastAppendTriggerAtRef.current = now
    appendRequestInFlightRef.current = true
    void fetchAndSetDocumentRecords({ append: true }).finally(() => {
      appendRequestInFlightRef.current = false
    })
  }, [fetchAndSetDocumentRecords, isLoadingMore, isLoadingSearch, searchMeta?.hasNextPage])

  useEffect(() => {
    setFromSearchParams({
      query: searchParams.get('search')?.trim() || '',
      jenisCarian: searchParams.get('jenisCarian') === 'hybrid' ? 'hybrid' : 'teks-penuh',
      jenisDokumen: searchParams.get('jenisDokumen') || '',
      unit: searchParams.get('unit') || '',
      dateFrom: searchParams.get('dateFrom') || '',
      dateTo: searchParams.get('dateTo') || '',
      sort: searchParams.get('sort') || 'desc',
      pageNumber: Math.max(1, Number(searchParams.get('page')) || 1),
      pageSize: LAZY_BATCH_SIZE,
    })
  }, [searchParams, setFromSearchParams])

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [unitsData, jenisDokumenData] = await Promise.all([
          getDropdownUnits(),
          getDropdownJenisDokumen(),
        ])
        setDropdownUnits(unitsData)
        setDropdownJenisDokumen(jenisDokumenData)
      } catch (err) {
        console.error('Error fetching dropdown data:', err)
      }
    }

    fetchDropdownData()
  }, [setDropdownJenisDokumen, setDropdownUnits])

  useEffect(() => {
    if (!query) {
      if (hadSearchQueryRef.current) {
        resetSearchState()
      }
      hadSearchQueryRef.current = false
      currentPageRef.current = 1
      return
    }

    hadSearchQueryRef.current = true
    currentPageRef.current = 1
    lastAppendTriggerAtRef.current = 0
    void fetchAndSetDocumentRecords({ append: false })
  }, [
    fetchAndSetDocumentRecords,
    dateFrom,
    dateTo,
    jenisCarian,
    query,
    resetSearchState,
    sort,
    unit,
    jenisDokumen,
  ])

  // Homepage with no search, currently imitating a single page of page search instead of 2
  if (!query) {
    return (
      <RightSidePageLayoutWrapper className="flex flex-col items-center justify-center h-full">
        <EmptySearchState />
      </RightSidePageLayoutWrapper>
    )
  }

  const resultCount = jenisCarian === 'hybrid' ? hybridRecords.length : documentRecords.length

  // First-time search loading (centered) - no results yet
  if (isLoadingSearch && resultCount === 0) {
    return (
      <RightSidePageLayoutWrapper className="flex flex-col items-center justify-center h-full">
        <SearchLoadingState />
      </RightSidePageLayoutWrapper>
    )
  }

  // Re-query or results view
  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <RightSidePageLayoutWrapper className="pb-0 flex flex-col gap-6">
        <MainHeading>Carian Kandungan</MainHeading>
        <div className="flex flex-col gap-3">
          <SearchBarCarianDokumen />
          <SelectCarianDokumenWithStore />
        </div>
      </RightSidePageLayoutWrapper>

      {isLoadingSearch ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12 h-full">
          <SearchLoadingState />
        </div>
      ) : resultCount === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12 h-full">
          <div className="text-body-sm text-txt-black-500 text-center max-w-md">
            Tiada dokumen ditemui. Sila lakukan carian semula.
          </div>
        </div>
      ) : (
        <div className="min-h-0 min-w-0">
          <DisplaySearchResults onLazyLoad={triggerAppendLoad} />
        </div>
      )}
      <AutoToast />
    </div>
  )
}
