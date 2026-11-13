import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import MainHeading from '@/components/layout/MainHeading'
import EmptySearchState from '@/components/page/CarianDokumen/EmptySearchState'
import SearchLoadingState from '@/components/page/CarianDokumen/SearchLoadingState'
import SearchBarCarianDokumen from '@/components/page/CarianDokumen/SearchBarCarianDokumen'
import DisplaySearchResults from '@/components/page/CarianDokumen/DisplaySearchResults'
import SelectCarianDokumenWithStore from '@/components/page/CarianDokumen/SelectCarianDokumenWithStore'
import { getHybridSearchRecords, getSearchRecordCarianDokumen } from '@/services/catalog.svc'
import { getDropdownJenisDokumen, getDropdownUnits } from '@/services/dropdown.svc'
import { useCallback, useEffect, useRef } from 'react'
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

const FULLTEXT_LAZY_BATCH_SIZE = 5
const HYBRID_LAZY_BATCH_SIZE = 10

export default function CarianDokumenPage() {
  const [searchParams] = useSearchParams()
  const isHybridSearch = searchParams.get('searchMode') === 'hibrid'
  const latestSearchRequestTokenRef = useRef(0)
  const hadSearchQueryRef = useRef(false)

  const query = useSearchStore((state) => state.query)
  const jenisDokumen = useSearchStore((state) => state.jenisDokumen)
  const unit = useSearchStore((state) => state.unit)
  const dateFrom = useSearchStore((state) => state.dateFrom)
  const dateTo = useSearchStore((state) => state.dateTo)
  const sort = useSearchStore((state) => state.sort)
  const isLoadingSearch = useSearchStore((state) => state.isLoadingSearch)
  const documentRecords = useSearchStore((state) => state.documentRecords)
  const setFromSearchParams = useSearchStore((state) => state.setFromSearchParams)
  const setIsLoadingSearch = useSearchStore((state) => state.setIsLoadingSearch)
  const setIsFetchingMoreRecords = useSearchStore((state) => state.setIsFetchingMoreRecords)
  const setDocumentRecords = useSearchStore((state) => state.setDocumentRecords)
  const setDocumentInfo = useSearchStore((state) => state.setDocumentInfo)
  const setSelectedKeywordId = useSearchStore((state) => state.setSelectedKeywordId)
  const setSearchMeta = useSearchStore((state) => state.setSearchMeta)
  const setDropdownUnits = useSearchStore((state) => state.setDropdownUnits)
  const setDropdownJenisDokumen = useSearchStore((state) => state.setDropdownJenisDokumen)
  const resetSearchState = useSearchStore((state) => state.resetSearchState)

  // Show the first batch right away, then keep fetching the rest in the background
  const fetchAndSetDocumentRecords = useCallback(async () => {
    const requestToken = ++latestSearchRequestTokenRef.current

    setSelectedKeywordId(null)
    setIsLoadingSearch(true)

    // Both search modes load batch by batch the same way; only the API call differs
    const fetchBatch = (page: number) =>
      isHybridSearch
        ? getHybridSearchRecords({ query, page, limit: HYBRID_LAZY_BATCH_SIZE })
        : getSearchRecordCarianDokumen({
            query,
            unit,
            jenisDokumen,
            dateFrom,
            dateTo,
            sort,
            page,
            limit: FULLTEXT_LAZY_BATCH_SIZE,
          })

    let hasShownFirstBatch = false

    try {
      let page = 1
      let hasNextPage = true

      while (hasNextPage) {
        const batch = await fetchBatch(page)

        if (requestToken !== latestSearchRequestTokenRef.current) {
          return
        }

        hasNextPage = batch.meta.hasNextPage && batch.items.length > 0

        if (page === 1) {
          setSearchMeta(batch.meta)
          setDocumentRecords(batch.items)
          if (!batch.items.length) {
            setDocumentInfo(null)
          }
          setIsLoadingSearch(false)
          setIsFetchingMoreRecords(hasNextPage)
          hasShownFirstBatch = true
        } else {
          const currentRecords = useSearchStore.getState().documentRecords
          setDocumentRecords([...currentRecords, ...batch.items])
        }

        page += 1
      }
    } catch (error) {
      if (requestToken !== latestSearchRequestTokenRef.current) {
        return
      }

      console.error('Search error:', error)
      // A later batch failing keeps the results already shown
      if (!hasShownFirstBatch) {
        setDocumentRecords([])
        setSearchMeta(null)
      }
    } finally {
      if (requestToken === latestSearchRequestTokenRef.current) {
        setIsLoadingSearch(false)
        setIsFetchingMoreRecords(false)
      }
    }
  }, [
    dateFrom,
    dateTo,
    jenisDokumen,
    query,
    sort,
    setDocumentInfo,
    setDocumentRecords,
    setIsFetchingMoreRecords,
    setIsLoadingSearch,
    setSearchMeta,
    setSelectedKeywordId,
    unit,
    isHybridSearch,
  ])

  useEffect(() => {
    setFromSearchParams({
      query: searchParams.get('search')?.trim() || '',
      jenisDokumen: searchParams.get('jenisDokumen') || '',
      unit: searchParams.get('unit') || '',
      dateFrom: searchParams.get('dateFrom') || '',
      dateTo: searchParams.get('dateTo') || '',
      sort: searchParams.get('sort') || 'desc',
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
      return
    }

    hadSearchQueryRef.current = true
    void fetchAndSetDocumentRecords()

    // Leaving the page or starting a new search stops the batches still being fetched
    return () => {
      latestSearchRequestTokenRef.current += 1
    }
  }, [
    fetchAndSetDocumentRecords,
    dateFrom,
    dateTo,
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

  // First-time search loading (centered) - no results yet
  if (isLoadingSearch && documentRecords.length === 0) {
    return (
      <RightSidePageLayoutWrapper className="flex flex-col items-center justify-center h-full">
        <SearchLoadingState />
      </RightSidePageLayoutWrapper>
    )
  }

  // Re-query or results view
  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <RightSidePageLayoutWrapper className="pb-0 pr-1 flex flex-col gap-4">
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
      ) : documentRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12 h-full">
          <div className="text-body-sm text-txt-black-500 text-center max-w-md">
            Tiada dokumen ditemui. Sila lakukan carian semula.
          </div>
        </div>
      ) : (
        <div className="min-h-0 min-w-0 flex-1 pb-6 pl-6 pr-1">
          <DisplaySearchResults />
        </div>
      )}
      <AutoToast />
    </div>
  )
}
