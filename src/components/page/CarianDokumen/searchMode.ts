import type { RecordSearchItem } from '@/services/catalog.svc'

export const SEARCH_MODE_PARAM = 'searchMode'

// The selected result lives in the URL so it survives a refresh and can be shared.
// `page` is already used for list pagination, so the selected page has its own key.
export const RECORD_ID_PARAM = 'recordId'
export const RECORD_PAGE_PARAM = 'recordPage'

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
