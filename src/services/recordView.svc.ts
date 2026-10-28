import { getEnv } from '@/config/runtimeEnv'
import type { CatalogListMeta } from './catalog.svc'
import { authAxios } from './http'

export interface RecordViewPage {
  pageNumber: number
  contentEditor: string
}

export interface RecordViewPagesResponse {
  items: RecordViewPage[]
  meta: CatalogListMeta
}

interface RecordViewApiResponse {
  success?: boolean
  data?: {
    items?: Partial<RecordViewPage>[] | null
    meta?: CatalogListMeta | null
  } | null
}

/**
 * Fetch a record's pages as HTML in chunks; each item is one document page.
 * GET /record/view/:recordId?page=&pageSize=
 *
 * Throws when the response is not a successful page list, so callers handle
 * every failure in one `catch`.
 */
export const getRecordViewPages = async (
  recordId: string,
  params: { page: number; pageSize: number }
): Promise<RecordViewPagesResponse> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/record/view/${encodeURIComponent(recordId)}`
  const response = await authAxios.get<RecordViewApiResponse>(url, { params })
  const { success, data } = response.data ?? {}

  if (!success || !Array.isArray(data?.items)) {
    throw new Error(`Unexpected record view response for record ${recordId}`)
  }

  const firstPageNumber = (params.page - 1) * params.pageSize + 1
  const items = data.items.map((item, index) => ({
    pageNumber: item.pageNumber ?? firstPageNumber + index,
    contentEditor: item.contentEditor ?? '',
  }))

  return {
    items,
    // Without meta, treat this chunk as the last one
    meta: data.meta ?? {
      currentPage: params.page,
      pageSize: params.pageSize,
      totalItems: firstPageNumber - 1 + items.length,
      totalPages: params.page,
      hasNextPage: false,
      hasPreviousPage: params.page > 1,
    },
  }
}
