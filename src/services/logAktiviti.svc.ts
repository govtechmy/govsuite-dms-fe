import { authAxios } from './http'
import { getEnv } from '@/config/runtimeEnv'

/**
 * Audit log categories returned by the backend.
 * Drives the `category` filter on GET /audit-logs.
 */
export const LOG_CATEGORY = {
  DOCUMENT_LIFECYCLE: 'DOCUMENT_LIFECYCLE',
  RECORD_LIFECYCLE: 'RECORD_LIFECYCLE',
  ACCESS_SECURITY: 'ACCESS_SECURITY',
  SHARING_DISTRIBUTION: 'SHARING_DISTRIBUTION',
  SEARCH_DISCOVERY: 'SEARCH_DISCOVERY',
  FOLDER_LIFECYCLE: 'FOLDER_LIFECYCLE',
  DASHBOARD_ACTIVITIES: 'DASHBOARD_ACTIVITIES',
  UNIT_MANAGEMENT: 'UNIT_MANAGEMENT',
  ROLE_MANAGEMENT: 'ROLE_MANAGEMENT',
} as const

export type LogCategory = (typeof LOG_CATEGORY)[keyof typeof LOG_CATEGORY]

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
  EXECUTIVE_SUMMARY: 'DASHBOARD_SUMMARY',
  MEETING_CATEGORY: 'MEETING_CATEGORY',
  LATEST_ACTIVITIES: 'LATEST_ACTIVITIES',
  PROFILE_TREND: 'PROFILE_TREND',
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
