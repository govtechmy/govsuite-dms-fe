import RecordResultSearch from './RecordResultSearch'
import MatchPageSearch from './MatchPageSearch'
import PratontonSearchResult from './PratontonSearchResult'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchStore } from '@/store/SearchStore'
import type {
  PdfSearchNavigationRequest,
  PdfSearchState,
} from '@/components/shared/PdfJsDocumentViewer'

// TODO: temporary design data, replace with the record match pages API
const SAMPLE_MATCH_PAGES = [1, 2, 4, 7, 9, 12, 15, 18, 21, 26, 30, 34]

interface FullTextSearchResultsProps {
  onLazyLoad: () => void
}

export default function FullTextSearchResults({ onLazyLoad }: FullTextSearchResultsProps) {
  const previewSearchQuery = useSearchStore((state) => state.query)
  const keywordRecords = useSearchStore((state) => state.keywordRecords)
  const selectedKeywordId = useSearchStore((state) => state.selectedKeywordId)
  const documentInfo = useSearchStore((state) => state.documentInfo)
  const setSelectedKeywordId = useSearchStore((state) => state.setSelectedKeywordId)

  const [activeMatchPage, setActiveMatchPage] = useState(SAMPLE_MATCH_PAGES[0])
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
        />
        <div className="order-first flex min-h-0 w-full shrink-0 flex-col gap-4 border-t px-4 pt-4 sm:px-6 sm:pt-6 md:order-none md:h-full md:w-[320px] md:border-y md:py-3 md:pl-0 lg:w-[360px]">
          <div className="flex flex-col md:min-h-0 md:flex-1 md:basis-0">
            <RecordResultSearch onLazyLoad={onLazyLoad} />
          </div>

          {/* <WordsResultSearch
            keywordRecords={keywordRecords}
            selectedKeywordId={selectedKeywordId}
            onKeywordSelect={onKeywordSelect}
          /> */}

          <div className="flex flex-col md:min-h-0 md:flex-1 md:basis-0">
            <MatchPageSearch
              pageNumbers={SAMPLE_MATCH_PAGES}
              activePage={activeMatchPage}
              onSelect={setActiveMatchPage}
            />
          </div>
        </div>
      </div>

      {/* <div className="flex flex-col items-center justify-center pt-6 gap-8">
        <div className="text-body-md font-semibold font-body">Perkataan Berkaitan "{keyword}"</div>
        <BubbleChart data={dataBubble} className="h-[700px] w-full" />
      </div> */}
    </div>
  )
}
