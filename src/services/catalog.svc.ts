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
  peringkat_keselamatan: string
  recordDate: string
  recordTitle: string
  recordUnit: string
  path: string
  profileDocument?: string
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
