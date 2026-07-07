import RecordResultSearch from './RecordResultSearch'
import PratontonSearchResult from './PratontonSearchResult'
import { searchPlugin } from '@react-pdf-viewer/search'
import { useEffect, useRef, useState } from 'react'
import { useSearchStore } from '@/store/SearchStore'

interface DisplaySearchResultsProps {
  onLazyLoad: () => void
}

export default function DisplaySearchResults({ onLazyLoad }: DisplaySearchResultsProps) {
  const previewSearchQuery = useSearchStore((state) => state.query)
  const keywordRecords = useSearchStore((state) => state.keywordRecords)
  const selectedKeywordId = useSearchStore((state) => state.selectedKeywordId)
  const documentInfo = useSearchStore((state) => state.documentInfo)
  const setSelectedKeywordId = useSearchStore((state) => state.setSelectedKeywordId)

  const searchPluginInstance = searchPlugin()
  const { highlight, jumpToMatch } = searchPluginInstance
  const lastSearchRef = useRef<string>('')
  const [isPdfLoaded, setIsPdfLoaded] = useState(false)
  const hasAutoSelectedRef = useRef(false)
  const lastDocumentIdRef = useRef<string>('')

  // Get the keyword text from keyword record
  const keyword = keywordRecords?.keyword || ''

  // Reset refs when document changes (new search or different document selected)
  useEffect(() => {
    const currentDocId = documentInfo?.documentID || ''
    if (currentDocId && currentDocId !== lastDocumentIdRef.current) {
      lastDocumentIdRef.current = currentDocId
      hasAutoSelectedRef.current = false
      lastSearchRef.current = ''
      setIsPdfLoaded(false)
    }
  }, [documentInfo?.documentID])

  // Auto-select first keyword once when PDF is loaded and keywords are available
  // Only auto-select if there's no existing selection (to avoid overriding user choices)
  useEffect(() => {
    if (isPdfLoaded && keywordRecords && !hasAutoSelectedRef.current && !selectedKeywordId) {
      hasAutoSelectedRef.current = true
      // Calculate first occurrence ID (following the same logic as WordsResultSearch)
      if (keywordRecords.dataPage.length > 0) {
        setSelectedKeywordId(`1`) // First occurrence is always 1
      }
    }
  }, [isPdfLoaded, keywordRecords, selectedKeywordId, setSelectedKeywordId])

  // Handle search when keyword selection changes
  useEffect(() => {
    if (!selectedKeywordId) return

    // Parse the occurrence number from the ID
    const occurrenceNumber = parseInt(selectedKeywordId)
    if (isNaN(occurrenceNumber)) return

    const keywordText = keyword

    const searchId = `${keywordText}-${occurrenceNumber}`
    if (lastSearchRef.current === searchId) return

    lastSearchRef.current = searchId

    // Highlight all matches and jump to specific occurrence (following DokumenID pattern)
    const timer = setTimeout(() => {
      highlight(keywordText).then(() => {
        const matchIndex = occurrenceNumber
        jumpToMatch(matchIndex)
      })
    }, 100)

    return () => clearTimeout(timer)
  }, [selectedKeywordId, keyword, highlight, jumpToMatch])

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-row items-stretch">
        <PratontonSearchResult
          previewSearchQuery={previewSearchQuery}
          searchPluginInstance={searchPluginInstance}
          onDocumentLoad={() => setIsPdfLoaded(true)}
        />
        <div className="flex min-h-0 w-full max-w-[320px] self-stretch flex-col items-center gap-6 border-y py-6 pl-6">
          <RecordResultSearch onLazyLoad={onLazyLoad} />

          {/* <WordsResultSearch
            keywordRecords={keywordRecords}
            selectedKeywordId={selectedKeywordId}
            onKeywordSelect={onKeywordSelect}
          /> */}
        </div>
      </div>

      {/* <div className="flex flex-col items-center justify-center pt-6 gap-8">
        <div className="text-body-md font-semibold font-body">Perkataan Berkaitan "{keyword}"</div>
        <BubbleChart data={dataBubble} className="h-[700px] w-full" />
      </div> */}
    </div>
  )
}
