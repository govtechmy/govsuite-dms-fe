import RecordResultSearch from './RecordResultSearch'
import PratontonSearchResult from './PratontonSearchResult'
import PageOccurrenceResultSearch from './PageOccurrenceResultSearch'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchStore } from '@/store/SearchStore'
import type {
  PdfSearchNavigationRequest,
  PdfSearchState,
} from '@/components/shared/PdfJsDocumentViewer'
import getRelevanceDotClass from '@/utils/getRelevanceDotClass'
import DocumentMetaTag from './DocumentMetaTag'
import { clx } from '@govtechmy/myds-react/utils'
import dataSampleHibrid from './hibridHtmlSample'

interface DisplaySearchResultsProps {
  onLazyLoad: () => void
}

export default function DisplaySearchResults({ onLazyLoad }: DisplaySearchResultsProps) {
  const previewSearchQuery = useSearchStore((state) => state.query)
  const keywordRecords = useSearchStore((state) => state.keywordRecords)
  const selectedKeywordId = useSearchStore((state) => state.selectedKeywordId)
  const documentInfo = useSearchStore((state) => state.documentInfo)
  const setSelectedKeywordId = useSearchStore((state) => state.setSelectedKeywordId)
  const isHybridSearch = useSearchStore((state) => state.jenisCarian === 'hybrid')

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
      <div className="flex min-h-0 min-w-0 flex-1 flex-col items-stretch lg:flex-row ml-6">
        <PratontonSearchResult
          searchKeyword={searchKeyword}
          navigationRequest={navigationRequest}
          onSearchStateChange={handleSearchStateChange}
          onDocumentLoad={handleDocumentLoad}
        />
        <div className="flex min-h-0 w-full shrink-0 flex-col items-center gap-6 pb-3 lg:h-full lg:w-[334px] lg:pb-0 lg:self-stretch lg:ml-6">
          {/* <WordsResultSearch
            keywordRecords={keywordRecords}
            selectedKeywordId={selectedKeywordId}
            onKeywordSelect={onKeywordSelect}
          /> */}

          {isHybridSearch ? (
            <div className="flex h-[560px] w-full flex-col gap-3 lg:h-full lg:min-h-0">
              <h2 className="text-body-md font-semibold text-txt-black-900">
                Hasil Carian ({dataSampleHibrid.data.meta.totalItems} rekod)
              </h2>

              {/* Temporary placeholder: dataSampleHibrid */}
              <ul
                className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1"
                aria-label="Senarai hasil carian"
              >
                {dataSampleHibrid.data.items.map((record) => {
                  return (
                    <li key={`${record.record_id}-${record.page_number}`}>
                      <button
                        type="button"
                        className="relative flex w-full cursor-pointer flex-col gap-2 rounded-lg border border-otl-gray-200 bg-bg-white p-3 text-left transition-colors hover:bg-bg-washed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fr-primary"
                      >
                        <span className="flex items-center gap-1.5 self-end text-body-xs font-semibold text-txt-black-900">
                          <span
                            className={clx(
                              'size-2 rounded-full',
                              getRelevanceDotClass(record.relevance_score)
                            )}
                            aria-hidden="true"
                          />
                          <span className="sr-only">Skor relevan</span>
                          {Math.round(record.relevance_score)}%
                        </span>
                        <p className="line-clamp-3 text-body-xs text-txt-black-700">
                          {record.snippet}
                        </p>
                        <p className="line-clamp-2 text-body-sm font-semibold text-txt-primary underline underline-offset-2">
                          {/* Temporary placeholder */}
                          Title
                        </p>
                        <DocumentMetaTag
                          jenisDokumen={'Dokumen'} //Temporary placeholder
                          tarikh={'11/22/2000'} //Temporary placeholder
                          mukaSurat={record.page_number}
                        />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : (
            <>
              <RecordResultSearch onLazyLoad={onLazyLoad} />
              <PageOccurrenceResultSearch />
            </>
          )}
        </div>
      </div>

      {/* <div className="flex flex-col items-center justify-center pt-6 gap-8">
        <div className="text-body-md font-semibold font-body">Perkataan Berkaitan "{keyword}"</div>
        <BubbleChart data={dataBubble} className="h-[700px] w-full" />
      </div> */}
    </div>
  )
}
