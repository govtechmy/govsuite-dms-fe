import type { DocumentRecord } from '@/store/SearchStore'

// TODO: the search mode only switches the result view for now; it is not sent to
// /record/search. Pass it to the search service once hybrid search exists.
export const SEARCH_MODE_PARAM = 'searchMode'

export const SEARCH_MODE = {
  TEKS: 'teks',
  HIBRID: 'hibrid',
} as const

export type SearchMode = (typeof SEARCH_MODE)[keyof typeof SEARCH_MODE]

// Props shared by both result lists; DisplaySearchResults owns the data and handlers
export interface RecordResultListProps {
  records: DocumentRecord[]
  totalItems: number
  selectedDocumentId: string | null
  onDocumentSelect: (documentId: string) => void
}
