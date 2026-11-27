import { getEnv } from '@/config/runtimeEnv'
import { authAxios, resolveApiUrl } from './http'

export const getRecordInfo = async (recordId: string) => {
  const url = `${getEnv('VITE_API_BASE_URL')}/record/${recordId}`
  try {
    const response = await authAxios.get(url)
    return response.data
  } catch (error) {
    console.error('Error getting record Info:', error)
    throw error
  }
}

export interface RecordViewPage {
  pageNumber: number
  recordPageUrl: string
  contentEditor: string
}

export const getRecordViewPages = async (
  recordId: string,
  pages: number[]
): Promise<RecordViewPage[]> => {
  const params = new URLSearchParams({ pages: pages.join(',') })
  const url = `${getEnv('VITE_API_BASE_URL')}/record/view/${encodeURIComponent(recordId)}/pages?${params.toString()}`
  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data ?? {}
    return Array.isArray(payload?.items)
      ? payload.items.map((item: Partial<RecordViewPage>) => ({
          pageNumber: Number(item?.pageNumber ?? 0),
          recordPageUrl: item?.recordPageUrl ? resolveApiUrl(item.recordPageUrl) : '',
          contentEditor: typeof item?.contentEditor === 'string' ? item.contentEditor : '',
        }))
      : []
  } catch (error) {
    console.error('Error getting record view pages:', error)
    throw error
  }
}
