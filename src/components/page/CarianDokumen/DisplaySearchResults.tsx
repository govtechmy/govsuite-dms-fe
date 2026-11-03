import HybridRecordResultSearch from './HybridRecordResultSearch'
import PageResultSearch from './PageResultSearch'
import FullTextRecordResultSearch from './FullTextRecordResultSearch'
import PratontonSearchResult from './PratontonSearchResult'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchStore } from '@/store/SearchStore'
import { useSearchParams } from 'react-router-dom'
import { SEARCH_MODE, SEARCH_MODE_PARAM, type RecordResultListProps } from './searchMode'
import type {
  PdfPageNavigationRequest,
  PdfSearchNavigationRequest,
  PdfSearchState,
} from '@/components/shared/PdfJsDocumentViewer'

export default function DisplaySearchResults() {
  const [searchParams] = useSearchParams()
  const isHybridSearch = searchParams.get(SEARCH_MODE_PARAM) === SEARCH_MODE.HIBRID
  const previewSearchQuery = useSearchStore((state) => state.query)
  const keywordRecords = useSearchStore((state) => state.keywordRecords)
  const selectedKeywordId = useSearchStore((state) => state.selectedKeywordId)
  const documentInfo = useSearchStore((state) => state.documentInfo)
  const setSelectedKeywordId = useSearchStore((state) => state.setSelectedKeywordId)
  const documentRecords = useSearchStore((state) => state.documentRecords)
  const totalItems = useSearchStore((state) => state.searchMeta?.totalItems)
  const selectedDocumentId = useSearchStore((state) => state.selectedDocumentId)
  const setSelectedDocumentId = useSearchStore((state) => state.setSelectedDocumentId)
  const fetchDocumentInfo = useSearchStore((state) => state.fetchDocumentInfo)

  const [searchKeyword, setSearchKeyword] = useState(previewSearchQuery)
  const [pdfSearchState, setPdfSearchState] = useState<PdfSearchState>({
    totalMatches: 0,
    currentMatchIndex: -1,
    isIndexing: true,
  })
  const [navigationRequest, setNavigationRequest] = useState<PdfSearchNavigationRequest | null>(
    null
  )
  const navigationTokenRef = useRef(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [pageNavigationRequest, setPageNavigationRequest] =
    useState<PdfPageNavigationRequest | null>(null)
  const pageNavigationTokenRef = useRef(0)
  const lastSearchRef = useRef<string>('')
  const [isPdfLoaded, setIsPdfLoaded] = useState(false)
  const hasAutoSelectedRef = useRef(false)
  const lastDocumentIdRef = useRef<string>('')

  // Get the keyword text from keyword record
  const keyword = keywordRecords?.keyword || ''

  const queueNavigationRequest = useCallback(
    (action: PdfSearchNavigationRequest['action'], targetMatchIndex?: number) => {
      navigationTokenRef.current += 1
      setNavigationRequest({
        action,
        targetMatchIndex,
        token: navigationTokenRef.current,
      })
    },
    []
  )

  const handleSearchStateChange = useCallback((nextSearchState: PdfSearchState) => {
    setPdfSearchState((previousSearchState) => {
      if (
        previousSearchState.totalMatches === nextSearchState.totalMatches &&
        previousSearchState.currentMatchIndex === nextSearchState.currentMatchIndex &&
        previousSearchState.isIndexing === nextSearchState.isIndexing
      ) {
        return previousSearchState
      }

      return nextSearchState
    })
  }, [])

  const handleDocumentLoad = useCallback(() => {
    setIsPdfLoaded((previousIsPdfLoaded) => (previousIsPdfLoaded ? previousIsPdfLoaded : true))
  }, [])

  const handlePreviousMatch = useCallback(() => {
    queueNavigationRequest('previous')
  }, [queueNavigationRequest])

  const handleNextMatch = useCallback(() => {
    queueNavigationRequest('next')
  }, [queueNavigationRequest])

  const handlePageChange = useCallback((nextCurrentPage: number, nextTotalPages: number) => {
    setCurrentPage(nextCurrentPage)
    setTotalPages(nextTotalPages)
  }, [])

  const handlePageSelect = useCallback((page: number) => {
    pageNavigationTokenRef.current += 1
    setPageNavigationRequest({ page, token: pageNavigationTokenRef.current })
  }, [])

  const handleDocumentSelect = useCallback(
    (documentId: string) => {
      if (selectedDocumentId === documentId) {
        return
      }

      setSelectedDocumentId(documentId)
      setSelectedKeywordId(null)
      void fetchDocumentInfo(documentId)
    },
    [fetchDocumentInfo, selectedDocumentId, setSelectedDocumentId, setSelectedKeywordId]
  )

  // TODO: lazy loading is disabled for now, so the lists only hold the first batch
  // while `totalItems` is the backend's full count. Re-enable it with an onScroll
  // handler that calls fetchAndSetDocumentRecords({ append: true }) in CarianDokumen.tsx.
  const recordListProps: RecordResultListProps = {
    records: documentRecords,
    totalItems: totalItems ?? documentRecords.length,
    selectedDocumentId,
    onDocumentSelect: handleDocumentSelect,
  }

  useEffect(() => {
    setSearchKeyword((previousSearchKeyword) =>
      previousSearchKeyword === previewSearchQuery ? previousSearchKeyword : previewSearchQuery
    )
  }, [previewSearchQuery])

  // Reset refs when document changes (new search or different document selected)
  useEffect(() => {
    const currentDocId = documentInfo?.documentID || ''
    if (currentDocId && currentDocId !== lastDocumentIdRef.current) {
      lastDocumentIdRef.current = currentDocId
      hasAutoSelectedRef.current = false
      lastSearchRef.current = ''
      setIsPdfLoaded(false)
      setPdfSearchState({
        totalMatches: 0,
        currentMatchIndex: -1,
        isIndexing: true,
      })
      setNavigationRequest(null)
      navigationTokenRef.current = 0
      setCurrentPage(1)
      setTotalPages(0)
      setPageNavigationRequest(null)
      pageNavigationTokenRef.current = 0
    }
  }, [documentInfo?.documentID])

  // Auto-select first keyword only after the first match has been indexed.
  useEffect(() => {
    if (
      isPdfLoaded &&
      keywordRecords &&
      !hasAutoSelectedRef.current &&
      !selectedKeywordId &&
      pdfSearchState.totalMatches > 0
    ) {
      hasAutoSelectedRef.current = true
      if (keywordRecords.dataPage.length > 0) {
        setSelectedKeywordId('1')
      }
    }
  }, [
    isPdfLoaded,
    keywordRecords,
    pdfSearchState.totalMatches,
    selectedKeywordId,
    setSelectedKeywordId,
  ])

  // Handle search when keyword selection changes.
  useEffect(() => {
    if (!selectedKeywordId) return

    const occurrenceNumber = Number.parseInt(selectedKeywordId, 10)
    if (Number.isNaN(occurrenceNumber)) return

    const keywordText = keyword.trim()
    const searchId = `${keywordText || searchKeyword}-${occurrenceNumber}`
    if (lastSearchRef.current === searchId) return

    lastSearchRef.current = searchId

    if (keywordText && keywordText !== searchKeyword) {
      setSearchKeyword(keywordText)
    }

    queueNavigationRequest('jump', Math.max(0, occurrenceNumber - 1))
  }, [selectedKeywordId, keyword, searchKeyword, queueNavigationRequest])

  return (
    <div className="flex flex-col gap-4 lg:h-full lg:min-h-[440px] lg:flex-row">
      <PratontonSearchResult
        searchKeyword={searchKeyword}
        currentMatchIndex={pdfSearchState.currentMatchIndex}
        totalMatches={pdfSearchState.totalMatches}
        onPreviousMatch={handlePreviousMatch}
        onNextMatch={handleNextMatch}
        navigationRequest={navigationRequest}
        pageNavigationRequest={pageNavigationRequest}
        onSearchStateChange={handleSearchStateChange}
        onDocumentLoad={handleDocumentLoad}
        onPageChange={handlePageChange}
        isIndexing={pdfSearchState.isIndexing}
      />
      {/* <WordsResultSearch
        keywordRecords={keywordRecords}
        selectedKeywordId={selectedKeywordId}
        onKeywordSelect={onKeywordSelect}
      /> */}
      {isHybridSearch ? (
        <div className="flex w-full shrink-0 lg:h-full lg:w-[320px]">
          <HybridRecordResultSearch {...recordListProps} />
        </div>
      ) : (
        <div className="flex w-full shrink-0 flex-col gap-4 lg:grid lg:h-full lg:w-[320px] lg:grid-rows-[3fr_2fr]">
          <FullTextRecordResultSearch {...recordListProps} />
          <PageResultSearch
            currentPage={currentPage}
            totalPages={totalPages}
            onPageSelect={handlePageSelect}
          />
        </div>
      )}

      {/* <div className="flex flex-col items-center justify-center pt-6 gap-8">
        <div className="text-body-md font-semibold font-body">Perkataan Berkaitan "{keyword}"</div>
        <BubbleChart data={dataBubble} className="h-[700px] w-full" />
      </div> */}
    </div>
  )
}
