import { create } from 'zustand'
import {
  getHybridSearchRecords,
  getSearchRecordCarianDokumen,
  type CatalogListMeta,
  type RecordSearchItem,
} from '@/services/catalog.svc'
import type { DropdownJenisDokumen, DropdownUnit } from '@/services/dropdown.svc'
import { getPdfGarage } from '@/services/pdf.svc'

export interface DocumentRecord {
  documentId: string
  title: string
  documentProfile?: string
  recordDate?: string
  fileType?: string
  fileExtension?: string
  pageNumber?: number
  snippet?: string
  relevancePercent?: number
}

export const toDocumentRecord = (item: RecordSearchItem): DocumentRecord => ({
  documentId: item.recordId,
  title: item.title,
  documentProfile: item.documentProfile,
  recordDate: item.recordDate,
  fileType: item.fileType,
  fileExtension: item.fileExtension,
  pageNumber: item.pageNumber,
  snippet: item.snippet,
  relevancePercent: item.relevancePercent,
})

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
  documentProfile?: string
  recordDate?: string
  unit?: string
  fileType?: string
  fileExtension?: string
}

type SearchParamsPayload = {
  query: string
  jenisDokumen: string
  unit: string
  dateFrom: string
  dateTo: string
  sort: string
  pageNumber: number
  pageSize: number
}

const DEFAULT_SORT = 'desc'
const DEFAULT_PAGE_NUMBER = 1
const DEFAULT_PAGE_SIZE = 10

const normalizePageNumber = (value: number) => Math.max(1, value || DEFAULT_PAGE_NUMBER)
const normalizePageSize = (value: number) => Math.max(1, value || DEFAULT_PAGE_SIZE)

let latestDocumentInfoRequestToken = 0
// Bumped whenever the record list is replaced, so an in-flight "load more" for the
// previous list is ignored
let documentRecordsVersion = 0

type SearchStore = {
  query: string
  jenisDokumen: string
  unit: string
  dateFrom: string
  dateTo: string
  sort: string
  pageNumber: number
  pageSize: number
  isLoadingSearch: boolean
  isLoadingMoreRecords: boolean
  loadMoreRecordsFailed: boolean
  documentRecords: DocumentRecord[]
  selectedDocumentId: string | null
  // Position of the selected result in documentRecords. Hybrid results are per matched
  // page, so the same document can appear more than once and the id alone is ambiguous
  selectedResultIndex: number | null
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
  setPageNumber: (pageNumber: number) => void
  setPageSize: (pageSize: number) => void
  setIsLoadingSearch: (isLoadingSearch: boolean) => void
  setDocumentRecords: (documentRecords: DocumentRecord[]) => void
  setSelectedDocumentId: (selectedDocumentId: string | null, resultIndex?: number) => void
  setKeywordRecords: (keywordRecords: KeywordRecord | null) => void
  setSelectedKeywordId: (selectedKeywordId: string | null) => void
  setDocumentInfo: (documentInfo: DocumentInfo | null) => void
  setSearchMeta: (searchMeta: CatalogListMeta | null) => void
  setDropdownUnits: (dropdownUnits: DropdownUnit[]) => void
  setDropdownJenisDokumen: (dropdownJenisDokumen: DropdownJenisDokumen[]) => void
  resetSearchState: () => void
  fetchDocumentInfo: (documentId: string) => Promise<void>
  // Appends the next page of full-text or hybrid search results (lazy loading)
  loadMoreDocumentRecords: (isHybridSearch?: boolean) => Promise<void>
  selectDocument: (documentId: string, resultIndex?: number) => void
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  query: '',
  jenisDokumen: '',
  unit: '',
  dateFrom: '',
  dateTo: '',
  sort: DEFAULT_SORT,
  pageNumber: DEFAULT_PAGE_NUMBER,
  pageSize: DEFAULT_PAGE_SIZE,
  isLoadingSearch: false,
  isLoadingMoreRecords: false,
  loadMoreRecordsFailed: false,
  documentRecords: [],
  selectedDocumentId: null,
  selectedResultIndex: null,
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
      pageNumber: normalizePageNumber(payload.pageNumber),
      pageSize: normalizePageSize(payload.pageSize),
    }),

  setQuery: (query) => set({ query, pageNumber: DEFAULT_PAGE_NUMBER }),
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
  setDocumentRecords: (documentRecords) => {
    documentRecordsVersion += 1
    set({ documentRecords, isLoadingMoreRecords: false, loadMoreRecordsFailed: false })
  },
  setSelectedDocumentId: (selectedDocumentId, resultIndex) =>
    set({ selectedDocumentId, selectedResultIndex: resultIndex ?? null }),
  setKeywordRecords: (keywordRecords) => set({ keywordRecords }),
  setSelectedKeywordId: (selectedKeywordId) => set({ selectedKeywordId }),
  setDocumentInfo: (documentInfo) => set({ documentInfo }),
  setSearchMeta: (searchMeta) => set({ searchMeta }),
  setDropdownUnits: (dropdownUnits) => set({ dropdownUnits }),
  setDropdownJenisDokumen: (dropdownJenisDokumen) => set({ dropdownJenisDokumen }),
  resetSearchState: () => {
    documentRecordsVersion += 1
    set({
      query: '',
      jenisDokumen: '',
      unit: '',
      dateFrom: '',
      dateTo: '',
      sort: DEFAULT_SORT,
      pageNumber: DEFAULT_PAGE_NUMBER,
      pageSize: DEFAULT_PAGE_SIZE,
      documentRecords: [],
      keywordRecords: null,
      selectedDocumentId: null,
      selectedResultIndex: null,
      selectedKeywordId: null,
      documentInfo: null,
      searchMeta: null,
      isLoadingSearch: false,
      isLoadingMoreRecords: false,
      loadMoreRecordsFailed: false,
    })
  },
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
          documentProfile: response.data.document?.documentProfile ?? '',
          recordDate: response.data.document?.recordDate ?? '',
          unit: response.data.document?.unit ?? '',
          fileType: response.data.meta?.fileType ?? '',
          fileExtension: response.data.meta?.fileExtension ?? '',
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
  loadMoreDocumentRecords: async (isHybridSearch = false) => {
    const { searchMeta, isLoadingMoreRecords, isLoadingSearch } = get()
    if (!searchMeta?.hasNextPage || isLoadingMoreRecords || isLoadingSearch) {
      return
    }

    const version = documentRecordsVersion
    set({ isLoadingMoreRecords: true, loadMoreRecordsFailed: false })

    try {
      const { query, unit, jenisDokumen, dateFrom, dateTo, sort, pageSize } = get()
      const page = searchMeta.currentPage + 1
      const response = isHybridSearch
        ? await getHybridSearchRecords({ query, page, limit: pageSize })
        : await getSearchRecordCarianDokumen({
            query,
            unit,
            jenisDokumen,
            dateFrom,
            dateTo,
            sort,
            page,
            limit: pageSize,
          })
      if (version !== documentRecordsVersion) return

      // Hybrid results are per matched page, so a record repeats with a different page
      const getRecordKey = (record: DocumentRecord) =>
        isHybridSearch ? `${record.documentId}-${record.pageNumber}` : record.documentId

      set((state) => {
        // Pages are offset-based, so a record published meanwhile shifts the results and
        // the next page can repeat records already in the list
        const loadedKeys = new Set(state.documentRecords.map(getRecordKey))
        const newRecords = response.items
          .map(toDocumentRecord)
          .filter((record) => !loadedKeys.has(getRecordKey(record)))

        return {
          documentRecords: [...state.documentRecords, ...newRecords],
          searchMeta: response.meta,
          isLoadingMoreRecords: false,
        }
      })
    } catch (error) {
      if (version !== documentRecordsVersion) return
      console.error('Load more search records error:', error)
      set({ isLoadingMoreRecords: false, loadMoreRecordsFailed: true })
    }
  },
  selectDocument: (documentId, resultIndex) => {
    if (get().selectedDocumentId === documentId) {
      set({ selectedResultIndex: resultIndex ?? null })
      return
    }

    set({
      selectedDocumentId: documentId,
      selectedResultIndex: resultIndex ?? null,
      selectedKeywordId: null,
    })
    void get().fetchDocumentInfo(documentId)
  },
}))
