import { authAxios } from './http'
import { getEnv } from '@/config/runtimeEnv'
import axios from 'axios'

/**
 * Audit log category codes, sourced from GET /lookup/categories (see dropdown.svc.ts).
 * Drives the `category` filter on GET /audit-logs.
 */
export type LogCategory = string

/**
 * Audit log actions returned by the backend.
 * The value of `LogAktivitiItem.action` drives which icon/design is used in the UI
 * (see LogAktivitiIconManager).
 */
export const LOG_ACTION = {
  UPLOAD_DOCUMENT: 'UPLOAD_DOCUMENT',
  CREATE_DOCUMENT: 'CREATE_DOCUMENT',
  DOWNLOAD_DOCUMENT: 'DOWNLOAD_DOCUMENT',
  ACCESS_DOCUMENT: 'ACCESS_DOCUMENT',
  UPDATE_DOCUMENT: 'UPDATE_DOCUMENT',
  DELETE_DOCUMENT: 'DELETE_DOCUMENT',
  ARCHIVE_DOCUMENT: 'ARCHIVE_DOCUMENT',
  UNARCHIVE_DOCUMENT: 'UNARCHIVE_DOCUMENT',
  DISPOSE_DOCUMENT: 'DISPOSE_DOCUMENT',
  READ_FOLDER: 'READ_FOLDER',
  ACCESS_FOLDER: 'ACCESS_FOLDER',
  CREATE_FOLDER: 'CREATE_FOLDER',
  UPDATE_FOLDER: 'UPDATE_FOLDER',
  DELETE_FOLDER: 'DELETE_FOLDER',
  MOVE_FOLDER: 'MOVE_FOLDER',
  READ_RECORD: 'READ_RECORD',
  ACCESS_RECORD: 'ACCESS_RECORD',
  CREATE_RECORD: 'CREATE_RECORD',
  UPDATE_RECORD: 'UPDATE_RECORD',
  DELETE_RECORD: 'DELETE_RECORD',
  MOVE_RECORD: 'MOVE_RECORD',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  SESSION_TIMEOUT: 'SESSION_TIMEOUT',
  CHANGE_PASSWORD: 'CHANGE_PASSWORD',
  RESET_PASSWORD: 'RESET_PASSWORD',
  ACCESS_DOCUMENT_FAILED: 'ACCESS_DOCUMENT_FAILED',
  READ_USER: 'READ_USER',
  ACCESS_USER: 'ACCESS_USER',
  CREATE_USER: 'CREATE_USER',
  UPDATE_USER: 'UPDATE_USER',
  ACTIVATE_USER: 'ACTIVATE_USER',
  DELETE_USER: 'DELETE_USER',
  CREATE_RECORD_PERMISSION: 'CREATE_RECORD_PERMISSION',
  UPDATE_RECORD_PERMISSION: 'UPDATE_RECORD_PERMISSION',
  DELETE_RECORD_PERMISSION: 'DELETE_RECORD_PERMISSION',
  SEARCH_RECORD: 'SEARCH_RECORD',
  EXECUTIVE_SUMMARY: 'EXECUTIVE_SUMMARY_DASHBOARD',
  MEETING_CATEGORY: 'MEETING_CATEGORY_DASHBOARD',
  LATEST_ACTIVITIES: 'LATEST_ACTIVITIES_DASHBOARD',
  PROFILE_TREND: 'PROFILE_TREND_DASHBOARD',
  CREATE_UNIT: 'CREATE_UNIT',
  UPDATE_UNIT: 'UPDATE_UNIT',
  DELETE_UNIT: 'DELETE_UNIT',
  CREATE_ROLE: 'CREATE_ROLE',
  UPDATE_ROLE: 'UPDATE_ROLE',
  DELETE_ROLE: 'DELETE_ROLE',
} as const

export type LogAction = (typeof LOG_ACTION)[keyof typeof LOG_ACTION]

export interface LogAktivitiItem {
  id: string
  createdAt: string
  actorUserId: string
  actorUserFullName: string
  actorUsername: string
  actorRole: string[]
  actorUnitId: string
  category: LogCategory
  action: LogAction
  description: string
}

export interface LogAktivitiListMeta {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface GetLogAktivitiListParams {
  search?: string
  category?: LogCategory
  action?: LogAction
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface GetLogAktivitiListResponse {
  items: LogAktivitiItem[]
  meta: LogAktivitiListMeta
}

/**
 * Get paginated list of activity logs for the Log Aktiviti page.
 * GET /audit-logs
 */
export const getLogAktivitiList = async (
  params: GetLogAktivitiListParams = {}
): Promise<GetLogAktivitiListResponse> => {
  const {
    search,
    category,
    action,
    dateFrom,
    dateTo,
    page = 1,
    limit = 15,
    sortBy,
    sortOrder,
  } = params

  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  if (search) searchParams.set('search', search)
  if (category) searchParams.set('category', category)
  if (action) searchParams.set('action', action)
  if (dateFrom) searchParams.set('dateFrom', dateFrom)
  if (dateTo) searchParams.set('dateTo', dateTo)
  if (sortBy) searchParams.set('sortBy', sortBy)
  if (sortOrder) searchParams.set('sortOrder', sortOrder)

  const url = `${getEnv('VITE_API_BASE_URL')}/audit-logs?${searchParams.toString()}`

  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data ?? {}
    const items: LogAktivitiItem[] = Array.isArray(payload?.items) ? payload.items : []
    const apiMeta = payload?.meta ?? {}

    return {
      items,
      meta: {
        currentPage: Number(apiMeta.currentPage ?? page),
        pageSize: Number(apiMeta.pageSize ?? limit),
        totalItems: Number(apiMeta.totalItems ?? items.length),
        totalPages: Number(apiMeta.totalPages ?? 1),
        hasNextPage: Boolean(apiMeta.hasNextPage),
        hasPreviousPage: Boolean(apiMeta.hasPreviousPage),
      },
    }
  } catch (error) {
    console.error('Error fetching log aktiviti list:', error)
    throw error
  }
}

export interface DownloadAuditLogsParams {
  search?: string
  category?: LogCategory
  action?: LogAction
  dateFrom?: string
  dateTo?: string
}

export interface DownloadAuditLogsResult {
  blob: Blob
  fileName: string
}

const DEFAULT_AUDIT_LOG_FILE_NAME = 'audit-logs.csv'

const extractFileNameFromContentDisposition = (contentDisposition?: string): string | null => {
  const match = contentDisposition ? /filename="?([^";]+)"?/i.exec(contentDisposition) : null
  return match?.[1] ?? null
}

/**
 * Download activity log records matching the given filters as a CSV file.
 * GET /audit-logs/download
 *
 * Backend always exports the full filtered result set (page/limit are ignored
 * server-side) and returns `text/csv` with the filename set via
 * `Content-Disposition`, currently a fixed "audit-logs.csv".
 */
export const downloadAuditLogs = async (
  params: DownloadAuditLogsParams = {}
): Promise<DownloadAuditLogsResult> => {
  const { search, category, action, dateFrom, dateTo } = params

  const searchParams = new URLSearchParams()
  if (search) searchParams.set('search', search)
  if (category) searchParams.set('category', category)
  if (action) searchParams.set('action', action)
  if (dateFrom) searchParams.set('dateFrom', dateFrom)
  if (dateTo) searchParams.set('dateTo', dateTo)

  const query = searchParams.toString()
  const url = `${getEnv('VITE_API_BASE_URL')}/audit-logs/download${query ? `?${query}` : ''}`

  try {
    const response = await authAxios.get(url, {
      responseType: 'blob',
    })

    return {
      blob: response.data,
      fileName:
        extractFileNameFromContentDisposition(response.headers?.['content-disposition']) ??
        DEFAULT_AUDIT_LOG_FILE_NAME,
    }
  } catch (error) {
    // `responseType: 'blob'` also blob-ifies JSON error bodies, which would
    // otherwise be unreadable by extractBackendError. Parse it back to JSON.
    if (
      axios.isAxiosError(error) &&
      error.response?.data instanceof Blob &&
      error.response.data.type.includes('json')
    ) {
      try {
        error.response.data = JSON.parse(await error.response.data.text())
      } catch {
        // Body wasn't valid JSON after all; fall through with the original error.
      }
    }

    console.error('Error downloading audit logs:', error)
    throw error
  }
}
