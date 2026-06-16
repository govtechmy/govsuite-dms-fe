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
  keywordRecords?: KeywordRecord[]
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
  keywordRecords = [],
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

  // Get the keyword text from the first keyword record (assuming single keyword search)
  const keyword = keywordRecords.length > 0 ? keywordRecords[0].keyword : ''

  // Auto-select first keyword once when PDF is loaded and keywords are available
  useEffect(() => {
    if (
      isPdfLoaded &&
      keywordRecords.length > 0 &&
      onKeywordSelect &&
      !hasAutoSelectedRef.current
    ) {
      hasAutoSelectedRef.current = true
      // Calculate first occurrence ID (following the same logic as WordsResultSearch)
      const firstRecord = keywordRecords[0]
      if (firstRecord.dataPage.length > 0) {
        onKeywordSelect(`0-1`) // First occurrence is always 0-1
      }
    }
  }, [isPdfLoaded, keywordRecords, onKeywordSelect])

  // Handle search when keyword selection changes
  useEffect(() => {
    if (!selectedKeywordId) return

    // Parse the selected keyword info from the ID (format: "recordIndex-occurrenceNumber")
    const parts = selectedKeywordId.split('-')
    if (parts.length !== 2) return

    const occurrenceNumber = parseInt(parts[1])
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
