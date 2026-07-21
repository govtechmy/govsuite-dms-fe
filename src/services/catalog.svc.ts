import { authAxios } from './http'
import { getEnv } from '@/config/runtimeEnv'

export interface CatalogBaseItem {
  id: string
  name: string
  type: string
  value: number
  hasChildren: boolean
  path: string
  description?: string
}

export interface CatalogFolderItem {
  type: 'folder'
  id: string
  parentId: string
  name: string
  fullPath: string
  level: number
  hasChildren: boolean
}

export interface CatalogDocumentItem {
  type: string
  id: string
  recordId: string
  folderId: string
  fileName: string
  status: string
  accessLevel: string
  recordDate: string
  recordTitle: string
  unit: string
  path: string
  documentProfile?: string
  reason?: string
  createdBy?: string
}

export interface CatalogListMeta {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

//fallback default for catalog list
const DEFAULT_CATALOG_LIST_META: CatalogListMeta = {
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
}

export interface CatalogFolderDocumentResponse {
  folder: {
    items: CatalogFolderItem[]
    meta: CatalogListMeta
  }
  record: {
    items: CatalogDocumentItem[]
    meta: CatalogListMeta
  }
}

export interface CatalogSearchResponse {
  items: CatalogDocumentItem[]
  meta: CatalogListMeta
}

export interface RecordSearchItem {
  recordId: string
  title: string
}

export interface RecordSearchResponse {
  search: {
    keyword: string
  }
  items: RecordSearchItem[]
  meta: CatalogListMeta
}

export interface CreateFolderPayload {
  name: string
  parentId?: string
}

export interface CatalogPaginationParams {
  page?: number
  limit?: number
}

export const getCatalogBase = async (): Promise<CatalogBaseItem[]> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/folder/main`
  try {
    const response = await authAxios.get(url)
    if (Array.isArray(response.data)) {
      return response.data
    }

    if (Array.isArray(response.data?.data)) {
      return response.data.data
    }

    return []
  } catch (error) {
    console.error('Error fetching catalog Base : ', error)
    throw error
  }
}

export const getCatalogFoldersAndDocuments = async (
  idFolder: string,
  pagination: CatalogPaginationParams = {}
): Promise<CatalogFolderDocumentResponse> => {
  const query = new URLSearchParams({
    page: String(pagination.page ?? 1),
    limit: String(pagination.limit ?? 10),
  }).toString()
  const url = `${getEnv('VITE_API_BASE_URL')}/folder/record/${idFolder}?${query}`
  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data

    return {
      folder: {
        items: payload?.folder?.items ?? [],
        meta: payload?.folder?.meta ?? DEFAULT_CATALOG_LIST_META,
      },
      record: {
        items: payload?.record?.items ?? [],
        meta: payload?.record?.meta ?? DEFAULT_CATALOG_LIST_META,
      },
    }
  } catch (error) {
    console.error('Error fetching Catalog Folders and Documents : ', error)
    throw error
  }
}

export const postCreateFolder = async (body: CreateFolderPayload): Promise<CatalogFolderItem> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/folder`
  try {
    const response = await authAxios.post(url, body)
    const payload = response.data?.data ?? response.data

    return payload
  } catch (error) {
    console.error('Error creating folder : ', error)
    throw error
  }
}

export const getSearchKatalogItems = async ({
  query,
  unit,
  jenisDokumen,
  dateFrom,
  dateTo,
  status,
  page = 1,
  limit = 15,
  year,
}: {
  query: string
  unit?: string
  jenisDokumen?: string
  dateFrom?: string
  dateTo?: string
  status?: string
  page?: number
  limit?: number
  year: string
}): Promise<CatalogSearchResponse> => {
  const params = new URLSearchParams({
    search: query,
    page: String(page),
    limit: String(limit),
  })

  if (unit) {
    params.set('unit', unit)
  }

  if (jenisDokumen) {
    params.set('jenisDokumen', jenisDokumen)
  }

  if (dateFrom) {
    params.set('dateFrom', dateFrom)
  }

  if (dateTo) {
    params.set('dateTo', dateTo)
  }

  if (status) {
    params.set('status', status)
  }

  if (year) {
    params.set('year', year)
  }

  const url = `${getEnv('VITE_API_BASE_URL')}/record?${params.toString()}`
  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data ?? {}
    const items = Array.isArray(payload?.items) ? payload.items : []
    const apiMeta = payload?.meta ?? {}
    const currentPage = Number(apiMeta.currentPage ?? page)
    const pageSize = Number(apiMeta.pageSize ?? limit)
    const totalItems = Number(apiMeta.totalItems ?? payload?.totalItems ?? items.length)
    const totalPages = Number(
      apiMeta.totalPages ??
        payload?.totalPages ??
        Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)))
    )

    return {
      items,
      meta: {
        ...DEFAULT_CATALOG_LIST_META,
        ...apiMeta,
        currentPage,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage:
          typeof apiMeta.hasNextPage === 'boolean' ? apiMeta.hasNextPage : currentPage < totalPages,
        hasPreviousPage:
          typeof apiMeta.hasPreviousPage === 'boolean' ? apiMeta.hasPreviousPage : currentPage > 1,
      },
    }
  } catch (error) {
    console.error('Error fetching searched catalog items : ', error)
    throw error
  }
}

export const getSearchRecordCarianDokumen = async ({
  query,
  unit,
  jenisDokumen,
  dateFrom,
  dateTo,
  sort,
  status,
  page = 1,
  limit = 10,
}: {
  query: string
  unit?: string
  jenisDokumen?: string
  dateFrom?: string
  dateTo?: string
  sort?: string
  status?: string
  page?: number
  limit?: number
}): Promise<RecordSearchResponse> => {
  const params = new URLSearchParams({
    search: query,
    page: String(page),
    limit: String(limit),
  })

  if (unit) {
    params.set('unit', unit)
  }

  if (jenisDokumen) {
    params.set('jenisDokumen', jenisDokumen)
  }

  if (dateFrom) {
    params.set('dateFrom', dateFrom)
  }

  if (dateTo) {
    params.set('dateTo', dateTo)
  }

  if (sort) {
    params.set('sort', sort)
  }

  if (status) {
    params.set('status', status)
  }

  const url = `${getEnv('VITE_API_BASE_URL')}/record/search?${params.toString()}`
  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data ?? {}
    const items: RecordSearchItem[] = Array.isArray(payload?.items)
      ? payload.items.map((item: { recordId?: string; title?: string }) => ({
          recordId: String(item?.recordId ?? ''),
          title: String(item?.title ?? ''),
        }))
      : []
    const apiMeta = payload?.meta ?? {}
    const currentPage = Number(apiMeta.currentPage ?? page)
    const pageSize = Number(apiMeta.pageSize ?? limit)
    const totalItems = Number(apiMeta.totalItems ?? payload?.totalItems ?? items.length)
    const totalPages = Number(
      apiMeta.totalPages ??
        payload?.totalPages ??
        Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)))
    )

    return {
      search: {
        keyword: String(payload?.search?.keyword ?? query),
      },
      items,
      meta: {
        ...DEFAULT_CATALOG_LIST_META,
        ...apiMeta,
        currentPage,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage:
          typeof apiMeta.hasNextPage === 'boolean' ? apiMeta.hasNextPage : currentPage < totalPages,
        hasPreviousPage:
          typeof apiMeta.hasPreviousPage === 'boolean' ? apiMeta.hasPreviousPage : currentPage > 1,
      },
    }
  } catch (error) {
    console.error('Error fetching searched catalog items : ', error)
    throw error
  }
}
