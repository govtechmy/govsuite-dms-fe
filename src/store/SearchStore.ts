import { create } from 'zustand'
import type { CatalogListMeta } from '@/services/catalog.svc'
import type { DropdownJenisDokumen, DropdownUnit } from '@/services/dropdown.svc'
import { getPdfGarage } from '@/services/pdf.svc'
import type { HybridSearchItem } from '@/services/search.svc'

export interface DocumentRecord {
  documentId: string
  title: string
  recordDate: string
  documentProfileName: string
  fileExtension: string
}

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

export type JenisCarian = 'teks-penuh' | 'hybrid'

type SearchParamsPayload = {
  query: string
  jenisCarian: JenisCarian
  jenisDokumen: string
  unit: string
  dateFrom: string
  dateTo: string
  sort: string
  pageNumber: number
  pageSize: number
}

const DEFAULT_JENIS_CARIAN: JenisCarian = 'teks-penuh'
const DEFAULT_SORT = 'desc'
const DEFAULT_PAGE_NUMBER = 1
const DEFAULT_PAGE_SIZE = 10

const normalizePageNumber = (value: number) => Math.max(1, value || DEFAULT_PAGE_NUMBER)
const normalizePageSize = (value: number) => Math.max(1, value || DEFAULT_PAGE_SIZE)

let latestDocumentInfoRequestToken = 0

type SearchStore = {
  query: string
  jenisCarian: JenisCarian
  jenisDokumen: string
  unit: string
  dateFrom: string
  dateTo: string
  sort: string
  pageNumber: number
  pageSize: number
  isLoadingSearch: boolean
  documentRecords: DocumentRecord[]
  selectedDocumentId: string | null
  hybridRecords: HybridSearchItem[]
  selectedHybridKey: string | null
  keywordRecords: KeywordRecord | null
  selectedKeywordId: string | null
  documentInfo: DocumentInfo | null
  searchMeta: CatalogListMeta | null
  dropdownUnits: DropdownUnit[]
  dropdownJenisDokumen: DropdownJenisDokumen[]
  setFromSearchParams: (payload: SearchParamsPayload) => void
  setQuery: (query: string) => void
  setJenisCarian: (jenisCarian: JenisCarian) => void
  setJenisDokumen: (jenisDokumen: string) => void
  setUnit: (unit: string) => void
  setDateRange: (dateFrom: string, dateTo: string) => void
  setSort: (sort: string) => void
  setPageNumber: (pageNumber: number) => void
  setPageSize: (pageSize: number) => void
  setIsLoadingSearch: (isLoadingSearch: boolean) => void
  setDocumentRecords: (documentRecords: DocumentRecord[]) => void
  setSelectedDocumentId: (selectedDocumentId: string | null) => void
  setHybridRecords: (hybridRecords: HybridSearchItem[]) => void
  setSelectedHybridKey: (selectedHybridKey: string | null) => void
  setKeywordRecords: (keywordRecords: KeywordRecord | null) => void
  setSelectedKeywordId: (selectedKeywordId: string | null) => void
  setDocumentInfo: (documentInfo: DocumentInfo | null) => void
  setSearchMeta: (searchMeta: CatalogListMeta | null) => void
  setDropdownUnits: (dropdownUnits: DropdownUnit[]) => void
  setDropdownJenisDokumen: (dropdownJenisDokumen: DropdownJenisDokumen[]) => void
  resetSearchState: () => void
  fetchDocumentInfo: (documentId: string) => Promise<void>
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  query: '',
  jenisCarian: DEFAULT_JENIS_CARIAN,
  jenisDokumen: '',
  unit: '',
  dateFrom: '',
  dateTo: '',
  sort: DEFAULT_SORT,
  pageNumber: DEFAULT_PAGE_NUMBER,
  pageSize: DEFAULT_PAGE_SIZE,
  isLoadingSearch: false,
  documentRecords: [],
  selectedDocumentId: null,
  hybridRecords: [],
  selectedHybridKey: null,
  keywordRecords: null,
  selectedKeywordId: null,
  documentInfo: null,
  searchMeta: null,
  dropdownUnits: [],
  dropdownJenisDokumen: [],

  setFromSearchParams: (payload) =>
    set({
      query: payload.query,
      jenisCarian: payload.jenisCarian,
      jenisDokumen: payload.jenisDokumen,
      unit: payload.unit,
      dateFrom: payload.dateFrom,
      dateTo: payload.dateTo,
      sort: payload.sort || DEFAULT_SORT,
      pageNumber: normalizePageNumber(payload.pageNumber),
      pageSize: normalizePageSize(payload.pageSize),
    }),

  setQuery: (query) => set({ query, pageNumber: DEFAULT_PAGE_NUMBER }),
  setJenisCarian: (jenisCarian) => set({ jenisCarian }),
  setJenisDokumen: (jenisDokumen) => set({ jenisDokumen, pageNumber: DEFAULT_PAGE_NUMBER }),
  setUnit: (unit) => set({ unit, pageNumber: DEFAULT_PAGE_NUMBER }),
  setDateRange: (dateFrom, dateTo) =>
    set({
      dateFrom,
      dateTo,
      pageNumber: DEFAULT_PAGE_NUMBER,
    }),
  setSort: (sort) => set({ sort: sort || DEFAULT_SORT, pageNumber: DEFAULT_PAGE_NUMBER }),
  setPageNumber: (pageNumber) => set({ pageNumber: normalizePageNumber(pageNumber) }),
  setPageSize: (pageSize) =>
    set({
      pageSize: normalizePageSize(pageSize),
      pageNumber: DEFAULT_PAGE_NUMBER,
    }),
  setIsLoadingSearch: (isLoadingSearch) => set({ isLoadingSearch }),
  setDocumentRecords: (documentRecords) => set({ documentRecords }),
  setSelectedDocumentId: (selectedDocumentId) => set({ selectedDocumentId }),
  setHybridRecords: (hybridRecords) => set({ hybridRecords }),
  setSelectedHybridKey: (selectedHybridKey) => set({ selectedHybridKey }),
  setKeywordRecords: (keywordRecords) => set({ keywordRecords }),
  setSelectedKeywordId: (selectedKeywordId) => set({ selectedKeywordId }),
  setDocumentInfo: (documentInfo) => set({ documentInfo }),
  setSearchMeta: (searchMeta) => set({ searchMeta }),
  setDropdownUnits: (dropdownUnits) => set({ dropdownUnits }),
  setDropdownJenisDokumen: (dropdownJenisDokumen) => set({ dropdownJenisDokumen }),
  resetSearchState: () =>
    set({
      query: '',
      jenisCarian: DEFAULT_JENIS_CARIAN,
      jenisDokumen: '',
      unit: '',
      dateFrom: '',
      dateTo: '',
      sort: DEFAULT_SORT,
      pageNumber: DEFAULT_PAGE_NUMBER,
      pageSize: DEFAULT_PAGE_SIZE,
      documentRecords: [],
      hybridRecords: [],
      keywordRecords: null,
      selectedDocumentId: null,
      selectedHybridKey: null,
      selectedKeywordId: null,
      documentInfo: null,
      searchMeta: null,
      isLoadingSearch: false,
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

      if (get().selectedDocumentId && get().selectedDocumentId !== documentId) {
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
