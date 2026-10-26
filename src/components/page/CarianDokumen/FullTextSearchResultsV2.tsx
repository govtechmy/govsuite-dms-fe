import RecordResultSearch from './RecordResultSearch'
import MatchPageSearch from './MatchPageSearch'
import PratontonSearchResult from './PratontonSearchResult'
import { useRecordMatchPages } from './useRecordMatchPages'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchStore } from '@/store/SearchStore'
import type {
  PdfSearchNavigationRequest,
  PdfSearchState,
} from '@/components/shared/PdfJsDocumentViewer'

export default function FullTextSearchResults() {
  const previewSearchQuery = useSearchStore((state) => state.query)
  const keywordRecords = useSearchStore((state) => state.keywordRecords)
  const selectedKeywordId = useSearchStore((state) => state.selectedKeywordId)
  const documentInfo = useSearchStore((state) => state.documentInfo)
  const selectedDocumentId = useSearchStore((state) => state.selectedDocumentId)
  const setSelectedKeywordId = useSearchStore((state) => state.setSelectedKeywordId)

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
  const lastSearchRef = useRef<string>('')
  const [isPdfLoaded, setIsPdfLoaded] = useState(false)
  const hasAutoSelectedRef = useRef(false)
  const lastDocumentIdRef = useRef<string>('')
  // Page picked from the match page list, tied to the record and keyword it was picked for
  const [pickedMatchPage, setPickedMatchPage] = useState<{ key: string; page: number } | null>(null)

  const recordMatchPages = useRecordMatchPages(selectedDocumentId, previewSearchQuery)
  const matchPagesKey = `${selectedDocumentId}:${previewSearchQuery}`

  // Only the selected page is fetched for the preview; default to the first matched page,
  // and to page 1 when the list failed or found nothing
  const previewPage =
    (pickedMatchPage?.key === matchPagesKey ? pickedMatchPage.page : null) ??
    recordMatchPages.pages[0]?.pageNumber ??
    (recordMatchPages.status === 'success' || recordMatchPages.status === 'error' ? 1 : null)

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

  const handleMatchPageSelect = useCallback(
    (page: number) => {
      setPickedMatchPage({ key: matchPagesKey, page })
    },
    [matchPagesKey]
  )

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
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col items-stretch md:flex-row">
        <div className="flex min-h-0 w-full shrink-0 flex-col items-center gap-6 border-y py-6 md:h-full md:w-[35%] md:self-stretch md:pl-6">
          <RecordResultSearch />

          {/* <WordsResultSearch
            keywordRecords={keywordRecords}
            selectedKeywordId={selectedKeywordId}
            onKeywordSelect={onKeywordSelect}
          /> */}
        </div>
        <div className="flex min-h-0 w-full shrink-0 flex-col border-y py-6 md:h-full md:w-[20%] md:self-stretch md:pl-6">
          <MatchPageSearch
            matchPages={recordMatchPages.pages}
            totalItems={recordMatchPages.totalItems}
            status={recordMatchPages.status}
            activePage={previewPage ?? undefined}
            hasMore={recordMatchPages.hasMore}
            isLoadingMore={recordMatchPages.isLoadingMore}
            loadMoreFailed={recordMatchPages.loadMoreFailed}
            onSelect={handleMatchPageSelect}
            onLoadMore={recordMatchPages.loadMore}
            onRetry={recordMatchPages.retry}
          />
        </div>
        <PratontonSearchResult
          searchKeyword={searchKeyword}
          currentMatchIndex={pdfSearchState.currentMatchIndex}
          totalMatches={pdfSearchState.totalMatches}
          onPreviousMatch={handlePreviousMatch}
          onNextMatch={handleNextMatch}
          navigationRequest={navigationRequest}
          onSearchStateChange={handleSearchStateChange}
          onDocumentLoad={handleDocumentLoad}
          isIndexing={pdfSearchState.isIndexing}
          page={previewPage}
        />
      </div>

      {/* <div className="flex flex-col items-center justify-center pt-6 gap-8">
        <div className="text-body-md font-semibold font-body">Perkataan Berkaitan "{keyword}"</div>
        <BubbleChart data={dataBubble} className="h-[700px] w-full" />
      </div> */}
    </div>
  )
}
