import type { RecordSearchItem } from '@/services/catalog.svc'

export const SEARCH_MODE_PARAM = 'searchMode'

export const SEARCH_MODE = {
  TEKS: 'teks',
  HIBRID: 'hibrid',
} as const

export type SearchMode = (typeof SEARCH_MODE)[keyof typeof SEARCH_MODE]

// Props shared by both result lists; DisplaySearchResults owns the data and handlers
export interface RecordResultListProps {
  records: RecordSearchItem[]
  totalItems: number
  selectedDocumentId: string | null
  onRecordSelect: (record: RecordSearchItem) => void
}
