import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import EmptySearchState from '@/components/page/CarianDokumen/EmptySearchState'
import SearchLoadingState from '@/components/page/CarianDokumen/SearchLoadingState'
import SearchResultsState from '@/components/page/CarianDokumen/SearchResultsState'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

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

export default function CarianDokumenPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('query')?.trim() || ''
  const jenisDokumen = searchParams.get('jenisDokumen') || ''
  const unit = searchParams.get('unit') || ''
  const dateFrom = searchParams.get('dateFrom') || ''
  const dateTo = searchParams.get('dateTo') || ''
  const sort = searchParams.get('sort') || 'latest'
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)
  const [documentRecords, setDocumentRecords] = useState<DocumentRecord[]>([])
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [keywordRecords, setKeywordRecords] = useState<KeywordRecord | null>(null)
  const [selectedKeywordId, setSelectedKeywordId] = useState<string | null>(null)
  const [documentInfo, setDocumentInfo] = useState<DocumentInfoResponse['data'] | null>(null)

  const handleDocumentSelect = (id: string) => {
    if (selectedDocumentId !== id) {
      setSelectedDocumentId(id)
      setSelectedKeywordId('1')
      fetchKeywordRecords(id)
      fetchDocumentInfo(id)
    }
  }

  const handleKeywordSelect = (id: string) => {
    setSelectedKeywordId(id)
  }

  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set('sort', value)
    } else {
      newParams.delete('sort')
    }
    setSearchParams(newParams)
  }

  useEffect(() => {
    if (!query) {
      setDocumentRecords([])
      setKeywordRecords(null)
      setDocumentInfo(null)
      setSelectedDocumentId(null)
      setSelectedKeywordId(null)
      return
    }

    const fetchDocumentRecords = async () => {
      // Reset selections at the start of a new search
      setSelectedKeywordId(null)
      setIsLoadingSearch(true)
      try {
        // Step 1: Fetch backend search response first
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock backend response - structure from backend
        const backendResponse: BackendSearchResponse = {
          data: {
            keyword: 'Tindakan',
            document: [
              { documentId: 'abc10001', title: 'Agenda Mesyuarat JKPPN (Mei 2026)' },
              { documentId: 'abc10002', title: 'Minit Mesyuarat JKPPN (Mei 2026)' },
              { documentId: 'abc10003', title: 'Agenda Mesyuarat JKPPN (April 2026)' },
              { documentId: 'abc10004', title: 'Minit Mesyuarat JKPPN (April 2026)' },
              { documentId: 'abc10005', title: 'Agenda Mesyuarat JKPPN (Mac 2026)' },
              { documentId: 'abc10006', title: 'Minit Mesyuarat JKPPN (Mac 2026)' },
              { documentId: 'abc10007', title: 'Agenda Mesyuarat JKPPN (Februari 2026)' },
              { documentId: 'abc10008', title: 'Minit Mesyuarat JKPPN (Februari 2026)' },
              { documentId: 'abc10009', title: 'Agenda Mesyuarat JKPPN (Januari 2026)' },
              { documentId: 'abc10010', title: 'Minit Mesyuarat JKPPN (Januari 2026)' },
            ],
          },
        }

        // Extract documents from backend response
        const documents = backendResponse.data.document
        setDocumentRecords(documents)

        // Step 2: After settling the fetch, fetch keyword records AND document info in parallel
        if (documents.length > 0) {
          setSelectedDocumentId(documents[0].documentId)
          // Fetch both in parallel
          await Promise.allSettled([
            fetchKeywordRecords(documents[0].documentId),
            fetchDocumentInfo(documents[0].documentId),
          ])
        }
      } catch (error) {
        console.error('Search error:', error)
        setDocumentRecords([])
      } finally {
        setIsLoadingSearch(false)
      }
    }

    fetchDocumentRecords()
  }, [query, jenisDokumen, unit, dateFrom, dateTo, sort])

  // Fetch keyword records for a specific document (triggered when a document is selected)
  const fetchKeywordRecords = async (documentId: string) => {
    try {
      // Mock data - EXACT backend response structure
      const mockKeywords: KeywordRecord = {
        keyword: 'Tindakan',
        documentID: documentId,
        dataPage: [
          { page1: Math.floor(Math.random() * 10) + 1 },
          { page3: Math.floor(Math.random() * 10) + 1 },
        ],
      }

      setKeywordRecords(mockKeywords)
    } catch (error) {
      console.error('Keyword records error:', error)
      setKeywordRecords(null)
    }
  }

  // Fetch document info for a specific document (triggered when a document is selected)
  const fetchDocumentInfo = async (documentId: string) => {
    try {
      // Mock backend response - structure from backend
      const mockDocInfo: DocumentInfoResponse = {
        data: {
          documentID: documentId,
          path: `www.something.com/pdf/${documentId}`,
        },
      }

      setDocumentInfo(mockDocInfo.data)
    } catch (error) {
      console.error('Document info error:', error)
      setDocumentInfo(null)
    }
  }

  // Initial search - fetch document records matching the query

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
    <SearchResultsState
      isLoadingSearchPage={isLoadingSearch}
      documentRecords={documentRecords}
      keywordRecords={keywordRecords}
      selectedDocumentId={selectedDocumentId}
      selectedKeywordId={selectedKeywordId}
      documentInfo={documentInfo}
      sortBy={sort}
      onDocumentSelect={handleDocumentSelect}
      onKeywordSelect={handleKeywordSelect}
      onSortChange={handleSortChange}
    />
  )
}
