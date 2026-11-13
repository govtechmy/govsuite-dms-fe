import { create } from 'zustand'
import type { CatalogListMeta, RecordSearchItem } from '@/services/catalog.svc'
import type { DropdownJenisDokumen, DropdownUnit } from '@/services/dropdown.svc'
import { getPdfGarage } from '@/services/pdf.svc'

export interface KeywordRecord {
  keyword: string
  documentID: string
  dataPage: Record<string, number>[]
}

export interface DocumentInfo {
  documentID: string
  path: string
  referencePath?: string
  title?: string
}

type SearchParamsPayload = {
  query: string
  jenisDokumen: string
  unit: string
  dateFrom: string
  dateTo: string
  sort: string
}

const DEFAULT_SORT = 'desc'

let latestDocumentInfoRequestToken = 0

type SearchStore = {
  query: string
  jenisDokumen: string
  unit: string
  dateFrom: string
  dateTo: string
  sort: string
  isLoadingSearch: boolean
  isFetchingMoreRecords: boolean
  documentRecords: RecordSearchItem[]
  keywordRecords: KeywordRecord | null
  selectedKeywordId: string | null
  documentInfo: DocumentInfo | null
  searchMeta: CatalogListMeta | null
  dropdownUnits: DropdownUnit[]
  dropdownJenisDokumen: DropdownJenisDokumen[]
  setFromSearchParams: (payload: SearchParamsPayload) => void
  setQuery: (query: string) => void
  setJenisDokumen: (jenisDokumen: string) => void
  setUnit: (unit: string) => void
  setDateRange: (dateFrom: string, dateTo: string) => void
  setSort: (sort: string) => void
  setIsLoadingSearch: (isLoadingSearch: boolean) => void
  setIsFetchingMoreRecords: (isFetchingMoreRecords: boolean) => void
  setDocumentRecords: (documentRecords: RecordSearchItem[]) => void
  setKeywordRecords: (keywordRecords: KeywordRecord | null) => void
  setSelectedKeywordId: (selectedKeywordId: string | null) => void
  setDocumentInfo: (documentInfo: DocumentInfo | null) => void
  setSearchMeta: (searchMeta: CatalogListMeta | null) => void
  setDropdownUnits: (dropdownUnits: DropdownUnit[]) => void
  setDropdownJenisDokumen: (dropdownJenisDokumen: DropdownJenisDokumen[]) => void
  resetSearchState: () => void
  fetchDocumentInfo: (documentId: string) => Promise<void>
}

export const useSearchStore = create<SearchStore>((set) => ({
  query: '',
  jenisDokumen: '',
  unit: '',
  dateFrom: '',
  dateTo: '',
  sort: DEFAULT_SORT,
  isLoadingSearch: false,
  isFetchingMoreRecords: false,
  documentRecords: [],
  keywordRecords: null,
  selectedKeywordId: null,
  documentInfo: null,
  searchMeta: null,
  dropdownUnits: [],
  dropdownJenisDokumen: [],

  setFromSearchParams: (payload) =>
    set({
      query: payload.query,
      jenisDokumen: payload.jenisDokumen,
      unit: payload.unit,
      dateFrom: payload.dateFrom,
      dateTo: payload.dateTo,
      sort: payload.sort || DEFAULT_SORT,
    }),

  setQuery: (query) => set({ query }),
  setJenisDokumen: (jenisDokumen) => set({ jenisDokumen }),
  setUnit: (unit) => set({ unit }),
  setDateRange: (dateFrom, dateTo) => set({ dateFrom, dateTo }),
  setSort: (sort) => set({ sort: sort || DEFAULT_SORT }),
  setIsLoadingSearch: (isLoadingSearch) => set({ isLoadingSearch }),
  setIsFetchingMoreRecords: (isFetchingMoreRecords) => set({ isFetchingMoreRecords }),
  setDocumentRecords: (documentRecords) => set({ documentRecords }),
  setKeywordRecords: (keywordRecords) => set({ keywordRecords }),
  setSelectedKeywordId: (selectedKeywordId) => set({ selectedKeywordId }),
  setDocumentInfo: (documentInfo) => set({ documentInfo }),
  setSearchMeta: (searchMeta) => set({ searchMeta }),
  setDropdownUnits: (dropdownUnits) => set({ dropdownUnits }),
  setDropdownJenisDokumen: (dropdownJenisDokumen) => set({ dropdownJenisDokumen }),
  resetSearchState: () =>
    set({
      query: '',
      jenisDokumen: '',
      unit: '',
      dateFrom: '',
      dateTo: '',
      sort: DEFAULT_SORT,
      documentRecords: [],
      keywordRecords: null,
      selectedKeywordId: null,
      documentInfo: null,
      searchMeta: null,
      isLoadingSearch: false,
      isFetchingMoreRecords: false,
    }),
  fetchDocumentInfo: async (documentId) => {
    if (!documentId) {
      set({ documentInfo: null })
      return
    }

    const requestToken = ++latestDocumentInfoRequestToken

    try {
      const response = await getPdfGarage({ id: documentId })

      if (requestToken !== latestDocumentInfoRequestToken) {
        return
      }

      if (!response.success) {
        console.error('Document info API error:', response.error)
        set({ documentInfo: null })
        return
      }

      set({
        documentInfo: {
          documentID: documentId,
          path: response.data.url,
          referencePath: response.data.document?.path ?? '',
          title: response.data.document?.recordTitle ?? '',
        },
      })
    } catch (error) {
      if (requestToken !== latestDocumentInfoRequestToken) {
        return
      }
      console.error('Document info error:', error)
      set({ documentInfo: null })
    }
  },
}))
