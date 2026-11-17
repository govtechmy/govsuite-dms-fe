import { authAxios } from './http'
import { getEnv } from '@/config/runtimeEnv'
import type { CatalogListMeta } from './catalog.svc'

export interface HybridSearchFile {
  path: string
  type: string
  extension: string
  sizeMb: number
}

export interface HybridSearchItem {
  record_id: string
  title: string
  page_number: number
  accessLevel: string
  recordDate: string
  documentProfile: string
  documentProfileName: string
  file: HybridSearchFile
  score: number
  keyword_score: number
  rerank_score: number
  relevance_score: number
  snippet: string | null
}

export interface HybridSearchRejection {
  top_reranker_score: number
  top_reranker_score_gap: number
  rerank_rejected: boolean
  rerank_rejection_reason: string | null
}

export interface HybridSearchResponse {
  request_id: string
  took_ms: number
  search: string
  items: HybridSearchItem[]
  ranking_mode: string
  rejection: HybridSearchRejection | null
  meta: CatalogListMeta
}

export const getHybridSearchItemKey = (item: Pick<HybridSearchItem, 'record_id' | 'page_number'>) =>
  `${item.record_id}-${item.page_number}`

export const postHybridSearch = async ({
  query,
  page = 1,
  limit = 10,
}: {
  query: string
  page?: number
  limit?: number
}): Promise<HybridSearchResponse> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/search/`
  try {
    const response = await authAxios.post(url, { query, page, limit })
    const payload = response.data?.data ?? response.data ?? {}
    const items: HybridSearchItem[] = Array.isArray(payload?.items) ? payload.items : []
    const apiMeta = payload?.meta ?? {}
    const currentPage = Number(apiMeta.currentPage ?? page)
    const pageSize = Number(apiMeta.pageSize ?? limit)
    const totalItems = Number(apiMeta.totalItems ?? items.length)
    const totalPages = Number(
      apiMeta.totalPages ?? Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)))
    )

    return {
      request_id: String(payload?.request_id ?? ''),
      took_ms: Number(payload?.took_ms ?? 0),
      search: String(payload?.search ?? query),
      items,
      ranking_mode: String(payload?.ranking_mode ?? ''),
      rejection: payload?.rejection ?? null,
      meta: {
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
    console.error('Error fetching hybrid search items : ', error)
    throw error
  }
}
