import HybridRecordResultSearch from './HybridRecordResultSearch'
import PageResultSearch from './PageResultSearch'
import FullTextRecordResultSearch from './FullTextRecordResultSearch'
import PratontonSearchResult from './PratontonSearchResult'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchStore } from '@/store/SearchStore'
import { useSearchParams } from 'react-router-dom'
import type {
  PdfSearchNavigationRequest,
  PdfSearchState,
} from '@/components/shared/PdfJsDocumentViewer'
import {
  getRecordMatchPages,
  type RecordSearchItem,
  type RecordMatchPage,
} from '@/services/catalog.svc'
import type { ProgressState } from '@/components/shared/ProgressResult'

export default function DisplaySearchResults() {
  const [searchParams] = useSearchParams()
  const isHybridSearch = searchParams.get('searchMode') === 'hibrid'
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [selectedPageNumber, setSelectedPageNumber] = useState<number | null>(null)
  const previewSearchQuery = useSearchStore((state) => state.query)
  const keywordRecords = useSearchStore((state) => state.keywordRecords)
  const selectedKeywordId = useSearchStore((state) => state.selectedKeywordId)
  const documentInfo = useSearchStore((state) => state.documentInfo)
  const setSelectedKeywordId = useSearchStore((state) => state.setSelectedKeywordId)
  const documentRecords = useSearchStore((state) => state.documentRecords)
  const searchMeta = useSearchStore((state) => state.searchMeta)
  const fetchDocumentInfo = useSearchStore((state) => state.fetchDocumentInfo)

  const setRecordSelection = useCallback((recordId: string | null, pageNumber: number | null) => {
    setSelectedDocumentId(recordId)
    setSelectedPageNumber(pageNumber)
  }, [])

  const [searchKeyword, setSearchKeyword] = useState(previewSearchQuery)
  const [pdfSearchState, setPdfSearchState] = useState<PdfSearchState>({
    totalMatches: 0,
    currentMatchIndex: -1,
    isIndexing: true,
  })
  const [navigationRequest, setNavigationRequest] = useState<PdfSearchNavigationRequest | null>(
    null
  )
  const [matchPages, setMatchPages] = useState<RecordMatchPage[] | null>(null)
  const [matchPagesFetchState, setMatchPagesFetchState] = useState<ProgressState>(null)
  const [matchPagesFetchError, setMatchPagesFetchError] = useState<string | null>(null)
  const [matchPagesRecordId, setMatchPagesRecordId] = useState<string | null>(null)
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

  const handleRecordSelect = useCallback(
    (record: RecordSearchItem) => {
      // Hybrid passage: the page comes with the result
      if (record.pageNumber !== undefined) {
        setRecordSelection(record.recordId, record.pageNumber)
        return
      }
      // Full text record: keep the selected page when the same record is clicked again;
      // for a new record the page is chosen once its match pages load
      if (record.recordId !== selectedDocumentId) {
        setRecordSelection(record.recordId, null)
      }
    },
    [selectedDocumentId, setRecordSelection]
  )

  const handlePageSelect = useCallback(
    (pageNumber: number) => {
      setRecordSelection(selectedDocumentId, pageNumber)
    },
    [selectedDocumentId, setRecordSelection]
  )

  // Select the first result when nothing is selected or the selection is not in these results
  useEffect(() => {
    const firstRecord = documentRecords[0]
    if (!firstRecord) return

    const isSelectionInResults = documentRecords.some(
      (record) =>
        record.recordId === selectedDocumentId &&
        (!isHybridSearch || record.pageNumber === selectedPageNumber)
    )
    if (!isSelectionInResults) {
      setRecordSelection(firstRecord.recordId, firstRecord.pageNumber ?? null)
    }
  }, [documentRecords, isHybridSearch, selectedDocumentId, selectedPageNumber, setRecordSelection])

  // Load the selected record's info (path, reference, title) used by the preview header
  useEffect(() => {
    if (selectedDocumentId) {
      void fetchDocumentInfo(selectedDocumentId)
    }
  }, [selectedDocumentId, fetchDocumentInfo])

  // Full text: load the pages of the selected record that contain the keyword
  useEffect(() => {
    if (isHybridSearch || !selectedDocumentId || !previewSearchQuery) {
      return
    }

    let ignore = false

    const fetchMatchPages = async () => {
      setMatchPagesFetchState('loading')
      setMatchPagesFetchError(null)
      setMatchPages(null)
      setMatchPagesRecordId(null)

      try {
        const result = await getRecordMatchPages({
          recordId: selectedDocumentId,
          query: previewSearchQuery,
        })
        if (ignore) return

        setMatchPages(result.items)
        setMatchPagesRecordId(selectedDocumentId)
        setMatchPagesFetchState('success')
      } catch (error) {
        if (ignore) return
        setMatchPagesFetchState('error')
        setMatchPagesFetchError(
          error instanceof Error ? error.message : 'Gagal memuatkan senarai muka surat.'
        )
      }
    }

    void fetchMatchPages()

    return () => {
      ignore = true
    }
  }, [isHybridSearch, selectedDocumentId, previewSearchQuery])

  // Full text: once the match pages of the selected record are loaded, keep the selected
  // page if it is one of them (e.g. after a refresh), otherwise select the first match
  useEffect(() => {
    if (
      isHybridSearch ||
      !selectedDocumentId ||
      matchPagesFetchState !== 'success' ||
      matchPagesRecordId !== selectedDocumentId
    ) {
      return
    }

    const pages = matchPages ?? []
    if (pages.some((page) => page.pageNumber === selectedPageNumber)) return

    const firstPageNumber = pages[0]?.pageNumber ?? null
    if (firstPageNumber !== selectedPageNumber) {
      setRecordSelection(selectedDocumentId, firstPageNumber)
    }
  }, [
    isHybridSearch,
    selectedDocumentId,
    selectedPageNumber,
    matchPages,
    matchPagesFetchState,
    matchPagesRecordId,
    setRecordSelection,
  ])

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
    <div className="flex flex-col gap-4 lg:h-full lg:min-h-[440px] lg:flex-row">
      <PratontonSearchResult
        searchKeyword={searchKeyword}
        currentMatchIndex={pdfSearchState.currentMatchIndex}
        totalMatches={pdfSearchState.totalMatches}
        onPreviousMatch={handlePreviousMatch}
        onNextMatch={handleNextMatch}
        navigationRequest={navigationRequest}
        onSearchStateChange={handleSearchStateChange}
        onDocumentLoad={handleDocumentLoad}
        onPageChange={() => {}}
        isIndexing={pdfSearchState.isIndexing}
        selectedDocumentId={selectedDocumentId}
        selectedPageNumber={selectedPageNumber}
      />
      {/* <WordsResultSearch
        keywordRecords={keywordRecords}
        selectedKeywordId={selectedKeywordId}
        onKeywordSelect={onKeywordSelect}
      /> */}
      {isHybridSearch ? (
        <div className="flex w-full shrink-0 lg:h-full lg:w-[320px]">
          <HybridRecordResultSearch
            records={documentRecords}
            totalItems={searchMeta?.totalItems ?? documentRecords.length}
            selectedDocumentId={selectedDocumentId}
            selectedPageNumber={selectedPageNumber}
            onRecordSelect={handleRecordSelect}
          />
        </div>
      ) : (
        <div className="flex w-full shrink-0 flex-col gap-4 lg:grid lg:h-full lg:w-[320px] lg:grid-rows-[3fr_2fr]">
          <FullTextRecordResultSearch
            records={documentRecords}
            totalItems={searchMeta?.totalItems ?? documentRecords.length}
            selectedDocumentId={selectedDocumentId}
            onRecordSelect={handleRecordSelect}
          />
          <PageResultSearch
            pages={matchPages}
            fetchState={matchPagesFetchState}
            fetchError={matchPagesFetchError}
            selectedPageNumber={selectedPageNumber}
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
