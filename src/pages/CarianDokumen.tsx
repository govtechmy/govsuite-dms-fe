import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import MainHeading from '@/components/layout/MainHeading'
import EmptySearchState from '@/components/page/CarianDokumen/EmptySearchState'
import SearchLoadingState from '@/components/page/CarianDokumen/SearchLoadingState'
import SearchBarCarianDokumen from '@/components/page/CarianDokumen/SearchBarCarianDokumen'
import DisplaySearchResults from '@/components/page/CarianDokumen/DisplaySearchResults'
import SelectCarianDokumenWithStore from '@/components/page/CarianDokumen/SelectCarianDokumenWithStore'
import SearchModeRadio from '@/components/page/CarianDokumen/SearchModeRadio'
import {
  SEARCH_PAGE_SIZE,
  SEARCH_PAGE_SIZE_OPTIONS,
} from '@/components/page/CarianDokumen/useSearchPage'
import { SEARCH_MODE, SEARCH_MODE_PARAM } from '@/components/page/CarianDokumen/searchMode'
import { getSearchRecordCarianDokumen } from '@/services/catalog.svc'
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

// Only hybrid search lets the user pick rows per page ("Baris Setiap Halaman");
// full-text search always shows a fixed page size.
const getSearchPageSize = (searchParams: URLSearchParams) => {
  if (searchParams.get(SEARCH_MODE_PARAM) !== SEARCH_MODE.HIBRID) {
    return SEARCH_PAGE_SIZE
  }

  const limit = Number(searchParams.get('limit'))
  return SEARCH_PAGE_SIZE_OPTIONS.includes(limit) ? limit : SEARCH_PAGE_SIZE
}

export default function CarianDokumenPage() {
  const [searchParams] = useSearchParams()
  const latestSearchRequestTokenRef = useRef(0)
  const hadSearchQueryRef = useRef(false)

  const query = useSearchStore((state) => state.query)
  const jenisDokumen = useSearchStore((state) => state.jenisDokumen)
  const unit = useSearchStore((state) => state.unit)
  const dateFrom = useSearchStore((state) => state.dateFrom)
  const dateTo = useSearchStore((state) => state.dateTo)
  const sort = useSearchStore((state) => state.sort)
  const pageNumber = useSearchStore((state) => state.pageNumber)
  const pageSize = useSearchStore((state) => state.pageSize)
  const isLoadingSearch = useSearchStore((state) => state.isLoadingSearch)
  const documentRecords = useSearchStore((state) => state.documentRecords)
  const setFromSearchParams = useSearchStore((state) => state.setFromSearchParams)
  const setIsLoadingSearch = useSearchStore((state) => state.setIsLoadingSearch)
  const setDocumentRecords = useSearchStore((state) => state.setDocumentRecords)
  const setDocumentInfo = useSearchStore((state) => state.setDocumentInfo)
  const setSelectedDocumentId = useSearchStore((state) => state.setSelectedDocumentId)
  const setSelectedKeywordId = useSearchStore((state) => state.setSelectedKeywordId)
  const setSearchMeta = useSearchStore((state) => state.setSearchMeta)
  const setDropdownUnits = useSearchStore((state) => state.setDropdownUnits)
  const setDropdownJenisDokumen = useSearchStore((state) => state.setDropdownJenisDokumen)
  const resetSearchState = useSearchStore((state) => state.resetSearchState)
  const fetchDocumentInfo = useSearchStore((state) => state.fetchDocumentInfo)

  const fetchAndSetDocumentRecords = useCallback(async () => {
    const requestToken = ++latestSearchRequestTokenRef.current

    setSelectedKeywordId(null)
    setIsLoadingSearch(true)

    try {
      const backendResponse = await getSearchRecordCarianDokumen({
        query,
        unit,
        jenisDokumen,
        dateFrom,
        dateTo,
        sort,
        page: pageNumber,
        limit: pageSize,
      })

      if (requestToken !== latestSearchRequestTokenRef.current) {
        return
      }

      setSearchMeta(backendResponse.meta)

      const documents = backendResponse.items.map((item) => ({
        documentId: item.recordId,
        title: item.title,
        documentProfile: item.documentProfile,
        recordDate: item.recordDate,
      }))

      setDocumentRecords(documents)

      const { selectLastOnNextLoad, setSelectLastOnNextLoad } = useSearchStore.getState()
      setSelectLastOnNextLoad(false)

      if (documents.length > 0) {
        const initialDocument = selectLastOnNextLoad
          ? documents[documents.length - 1]
          : documents[0]
        setSelectedDocumentId(initialDocument.documentId)
        await Promise.allSettled([fetchDocumentInfo(initialDocument.documentId)])
      } else {
        setSelectedDocumentId(null)
        setDocumentInfo(null)
      }
    } catch (error) {
      if (requestToken !== latestSearchRequestTokenRef.current) {
        return
      }

      console.error('Search error:', error)
      useSearchStore.getState().setSelectLastOnNextLoad(false)
      setDocumentRecords([])
      setSearchMeta(null)
    } finally {
      if (requestToken === latestSearchRequestTokenRef.current) {
        setIsLoadingSearch(false)
      }
    }
  }, [
    dateFrom,
    dateTo,
    fetchDocumentInfo,
    jenisDokumen,
    pageNumber,
    pageSize,
    query,
    sort,
    setDocumentInfo,
    setDocumentRecords,
    setIsLoadingSearch,
    setSearchMeta,
    setSelectedDocumentId,
    setSelectedKeywordId,
    unit,
  ])

  useEffect(() => {
    setFromSearchParams({
      query: searchParams.get('search')?.trim() || '',
      jenisDokumen: searchParams.get('jenisDokumen') || '',
      unit: searchParams.get('unit') || '',
      dateFrom: searchParams.get('dateFrom') || '',
      dateTo: searchParams.get('dateTo') || '',
      sort: searchParams.get('sort') || 'desc',
      pageNumber: Math.max(1, Number(searchParams.get('page')) || 1),
      pageSize: getSearchPageSize(searchParams),
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
  }, [fetchAndSetDocumentRecords, query, resetSearchState])

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
      <RightSidePageLayoutWrapper className="pb-0 flex flex-col gap-6">
        <MainHeading>Carian Kandungan</MainHeading>
        <div className="flex flex-col gap-3">
          <SearchBarCarianDokumen />
          <SelectCarianDokumenWithStore />
        </div>
        <SearchModeRadio />
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
        <div className="min-h-0 min-w-0 flex-1">
          <DisplaySearchResults />
        </div>
      )}
      <AutoToast />
    </div>
  )
}
