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
  documentProfil?: string
  path: string
}

export interface CatalogFolderDocumentResponse {
  folder: {
    items: CatalogFolderItem[]
  }
  record: {
    items: CatalogDocumentItem[]
  }
}

export interface CreateFolderPayload {
  name: string
  parentId?: string
}

export const getCatalogBase = async (): Promise<CatalogBaseItem[]> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/folder/main`
  try {
    const response = await authAxios.get(url)
    console.log(`this is response for catalog base`, response)
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
  idFolder: string
): Promise<CatalogFolderDocumentResponse> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/folder/record/${idFolder}`
  try {
    const response = await authAxios.get(url)
    console.log(`response here is for catalog folders and docs`, response)
    const payload = response.data?.data ?? response.data

    return {
      folder: {
        items: payload?.folder?.items ?? [],
      },
      record: {
        items: payload?.record?.items ?? [],
      },
    }
  } catch (error) {
    console.error('Error fetching catalog Base : ', error)
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
