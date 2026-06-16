import RecordResultSearch from './RecordResultSearch'
import { WordsResultSearch } from './WordsResultSearch'
import PratontonSearchResult from './PratontonSearchResult'
import BubbleChart from '@/components/shared/BubbleChart'
import { dataBubble } from '@/data'
import { searchPlugin } from '@react-pdf-viewer/search'
import { useEffect, useRef, useState } from 'react'

interface DocumentRecord {
  documentId: string
  title: string
}

interface KeywordRecord {
  keyword: string
  dataPage: Record<string, number>[]
}

interface DocumentInfo {
  documentID: string
  path: string
}

interface DisplaySearchResultsProps {
  documentRecords?: DocumentRecord[]
  keywordRecords?: KeywordRecord | null
  selectedDocumentId?: string | null
  selectedKeywordId?: string | null
  documentInfo?: DocumentInfo | null
  sortBy?: string
  onDocumentSelect?: (id: string) => void
  onKeywordSelect?: (id: string) => void
  onSortChange?: (value: string) => void
}

export default function DisplaySearchResults({
  documentRecords = [],
  keywordRecords = null,
  selectedDocumentId,
  selectedKeywordId,
  documentInfo,
  sortBy,
  onDocumentSelect,
  onKeywordSelect,
  onSortChange,
}: DisplaySearchResultsProps) {
  // Create search plugin instance (following DokumenID pattern)
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
    if (
      isPdfLoaded &&
      keywordRecords &&
      onKeywordSelect &&
      !hasAutoSelectedRef.current &&
      !selectedKeywordId
    ) {
      hasAutoSelectedRef.current = true
      // Calculate first occurrence ID (following the same logic as WordsResultSearch)
      if (keywordRecords.dataPage.length > 0) {
        onKeywordSelect(`1`) // First occurrence is always 1
      }
    }
  }, [isPdfLoaded, keywordRecords, onKeywordSelect, selectedKeywordId])

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
    <div className="flex flex-col">
      <div className="flex flex-row h-full">
        <PratontonSearchResult
          documentInfo={documentInfo}
          searchPluginInstance={searchPluginInstance}
          onDocumentLoad={() => setIsPdfLoaded(true)}
        />
        <div className="flex h-full w-full flex-col items-center gap-6 py-6 max-w-[320px] border-y pl-6">
          <RecordResultSearch
            documentRecords={documentRecords}
            selectedDocumentId={selectedDocumentId}
            sortBy={sortBy}
            onDocumentSelect={onDocumentSelect}
            onSortChange={onSortChange}
          />

          <WordsResultSearch
            keywordRecords={keywordRecords}
            selectedKeywordId={selectedKeywordId}
            onKeywordSelect={onKeywordSelect}
          />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center pt-6 gap-8">
        <div className="text-body-md font-semibold font-body">Perkataan Berkaitan "{keyword}"</div>
        <BubbleChart data={dataBubble} className="h-[700px] w-full" />
      </div>
    </div>
  )
}
