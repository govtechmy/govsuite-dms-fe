import { getEnv } from '@/config/runtimeEnv'
import { authAxios } from './http'

export interface RecordViewPage {
  pageNumber: number
  // HTML of the page for the document viewer
  contentEditor: string
}

export interface RecordViewMeta {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface RecordViewPagesResponse {
  items: RecordViewPage[]
  meta: RecordViewMeta
}

/**
 * Fetch a record's pages as HTML in chunks; each item is one document page.
 * GET /record/view/:recordId?page=&pageSize=
 */
export const getRecordViewPages = async (
  recordId: string,
  params: { page: number; pageSize: number }
): Promise<RecordViewPagesResponse> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/record/view/${encodeURIComponent(recordId)}`
  const response = await authAxios.get(url, { params })
  return response.data.data
}

/**
 * Fetch only the given page of a record as HTML.
 * GET /record/view/:recordId/pages?pages=
 */
export const getRecordViewPage = async (
  recordId: string,
  page: number
): Promise<Pick<RecordViewPagesResponse, 'items'>> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/record/view/${encodeURIComponent(recordId)}/pages`
  const response = await authAxios.get(url, { params: { pages: page } })
  return response.data.data
}
