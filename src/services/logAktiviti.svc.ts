/**
 * System-defined actions that can appear in the activity log.
 * The value of `LogAktivitiItem.action` drives which icon/design is used in the UI
 * (see LogAktivitiIconManager).
 */
export const SystemAction = {
  // Auth
  LOG_IN: 'LOG_IN',
  LOG_OUT: 'LOG_OUT',

  // Users
  READ_USERS_LIST: 'READ_USERS_LIST',
  READ_USER_DETAILS: 'READ_USER_DETAILS',
  CREATE_USER: 'CREATE_USER',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
  RESET_USER_PASSWORD: 'RESET_USER_PASSWORD',

  // Folder
  READ_FOLDER: 'READ_FOLDER',
  CREATE_FOLDER: 'CREATE_FOLDER',
  UPDATE_FOLDER: 'UPDATE_FOLDER',
  DELETE_FOLDER: 'DELETE_FOLDER',

  // Record
  CREATE_RECORD: 'CREATE_RECORD',
  UPDATE_RECORD: 'UPDATE_RECORD',
  DELETE_RECORD: 'DELETE_RECORD',
  DELETE_RECORD_BY_FOLDER: 'DELETE_RECORD_BY_FOLDER',
  READ_RECORDS_LIST: 'READ_RECORDS_LIST',
  READ_RECORD_DETAILS: 'READ_RECORD_DETAILS',
  READ_RECORD_METADATA: 'READ_RECORD_METADATA',
  READ_RECORD_BY_FOLDER: 'READ_RECORD_BY_FOLDER',
  SEARCH_RECORD: 'SEARCH_RECORD',

  // Document
  ACCESS_DOCUMENT: 'ACCESS_DOCUMENT',
  CREATE_DOCUMENT: 'CREATE_DOCUMENT',
  UPDATE_DOCUMENT: 'UPDATE_DOCUMENT',
  DELETE_DOCUMENT: 'DELETE_DOCUMENT',
  UPLOAD_DOCUMENT: 'UPLOAD_DOCUMENT',
  DOWNLOAD_DOCUMENT: 'DOWNLOAD_DOCUMENT',
  APPROVE_DOCUMENT: 'APPROVE_DOCUMENT',
  DISAPPROVE_DOCUMENT: 'DISAPPROVE_DOCUMENT',

  // Record Permission
  CREATE_RECORD_PERMISSION: 'CREATE_RECORD_PERMISSION',
  UPDATE_RECORD_PERMISSION: 'UPDATE_RECORD_PERMISSION',
  DELETE_RECORD_PERMISSION: 'DELETE_RECORD_PERMISSION',

  // Roles
  CREATE_ROLE: 'CREATE_ROLE',
  UPDATE_ROLE: 'UPDATE_ROLE',
  DELETE_ROLE: 'DELETE_ROLE',

  // Unit
  CREATE_UNIT: 'CREATE_UNIT',
  UPDATE_UNIT: 'UPDATE_UNIT',
  DELETE_UNIT: 'DELETE_UNIT',

  // Dashboard
  READ_DASHBOARD: 'READ_DASHBOARD',
} as const

export type SystemAction = (typeof SystemAction)[keyof typeof SystemAction]

export interface LogAktivitiItem {
  id: string
  nama: string
  email: string
  action: SystemAction
  aksi: string
  sasaran?: string
  sasaranEmel?: string
  tarikh: string
  selangMasa: string
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
  query?: string
  jenisDokumen?: string
  year?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface GetLogAktivitiListResponse {
  items: LogAktivitiItem[]
  meta: LogAktivitiListMeta
}

const mockLogs: LogAktivitiItem[] = [
  {
    id: '1',
    nama: 'Mohd Muzakkir Zamani Bin Fairuzzaki',
    email: 'muzakkir@digital.gov.my',
    action: SystemAction.ACCESS_DOCUMENT,
    aksi: 'telah membuka dokumen',
    sasaran: 'Minit Mesyuarat JKPPN (Januari 2026)',
    tarikh: '04/01/2026 09:00 AM',
    selangMasa: '1 minit lalu',
  },
  {
    id: '2',
    nama: 'Wong Chi Han',
    email: 'wongch@digital.gov.my',
    action: SystemAction.LOG_IN,
    aksi: 'telah log masuk.',
    tarikh: '04/01/2026 08:00 AM',
    selangMasa: '1 jam lalu',
  },
  {
    id: '3',
    nama: 'Wong Chi Han',
    email: 'wongch@digital.gov.my',
    action: SystemAction.LOG_OUT,
    aksi: 'telah log keluar.',
    tarikh: '03/01/2026 06:00 PM',
    selangMasa: '8 jam lalu',
  },
  {
    id: '4',
    nama: 'Muhammad Aidan Aris Bin Saiful Bukhary',
    email: 'm.aidan@digital.gov.my',
    action: SystemAction.DELETE_USER,
    aksi: 'telah membuang akaun pengguna',
    sasaran: 'Muhammad Saiful Bin Bahri',
    sasaranEmel: 'm.saiful@digital.gov.my',
    tarikh: '03/01/2026 05:00 PM',
    selangMasa: '9 jam lalu',
  },
  {
    id: '5',
    nama: 'Mohd Muzakkir Zamani Bin Fairuzzaki',
    email: 'muzakkir@digital.gov.my',
    action: SystemAction.APPROVE_DOCUMENT,
    aksi: 'telah meluluskan dokumen',
    sasaran: 'Minit Mesyuarat JKPPN (Januari 2026)',
    tarikh: '02/01/2026 04:45 PM',
    selangMasa: '1 hari lalu',
  },
  {
    id: '6',
    nama: 'Mohd Muzakkir Zamani Bin Fairuzzaki',
    email: 'muzakkir@digital.gov.my',
    action: SystemAction.UPLOAD_DOCUMENT,
    aksi: 'telah memuat naik dokumen',
    sasaran: 'Minit Mesyuarat JKPPN (Januari 2026)',
    tarikh: '02/01/2026 04:45 PM',
    selangMasa: '1 hari lalu',
  },
  {
    id: '7',
    nama: 'Mohd Muzakkir Zamani Bin Fairuzzaki',
    email: 'muzakkir@digital.gov.my',
    action: SystemAction.DISAPPROVE_DOCUMENT,
    aksi: 'telah tidak meluluskan dokumen',
    sasaran: 'Minit Mesyuarat JPICT (Disember 2024)',
    tarikh: '02/01/2026 04:45 PM',
    selangMasa: '1 hari lalu',
  },
  {
    id: '8',
    nama: 'Muhammad Aidan Aris Bin Saiful Bukhary',
    email: 'm.aidan@digital.gov.my',
    action: SystemAction.CREATE_USER,
    aksi: 'telah menambah akaun pengguna',
    sasaran: 'Suhairi Bin Ibrahim',
    sasaranEmel: 'suha@digital.gov.my',
    tarikh: '02/01/2026 04:45 PM',
    selangMasa: '1 hari lalu',
  },
  {
    id: '9',
    nama: 'Mohd Muzakkir Zamani Bin Fairuzzaki',
    email: 'muzakkir@digital.gov.my',
    action: SystemAction.APPROVE_DOCUMENT,
    aksi: 'telah meluluskan dokumen',
    sasaran: 'Minit Mesyuarat JKPPN (Januari 2026)',
    tarikh: '02/01/2026 04:45 PM',
    selangMasa: '1 hari lalu',
  },
  {
    id: '10',
    nama: 'Mohd Muzakkir Zamani Bin Fairuzzaki',
    email: 'muzakkir@digital.gov.my',
    action: SystemAction.UPLOAD_DOCUMENT,
    aksi: 'telah memuat naik dokumen',
    sasaran: 'Minit Mesyuarat JKPPN (Januari 2026)',
    tarikh: '02/01/2026 04:45 PM',
    selangMasa: '1 hari lalu',
  },
  {
    id: '11',
    nama: 'Mohd Muzakkir Zamani Bin Fairuzzaki',
    email: 'muzakkir@digital.gov.my',
    action: SystemAction.DISAPPROVE_DOCUMENT,
    aksi: 'telah tidak meluluskan dokumen',
    sasaran: 'Minit Mesyuarat JKPPN (Januari 2026)',
    tarikh: '02/01/2026 04:45 PM',
    selangMasa: '1 hari lalu',
  },
  {
    id: '12',
    nama: 'Muhammad Aidan Aris Bin Saiful Bukhary',
    email: 'm.aidan@digital.gov.my',
    action: SystemAction.CREATE_USER,
    aksi: 'telah menambah akaun pengguna',
    sasaran: 'Suhairi Bin Ibrahim',
    sasaranEmel: 'suha@digital.gov.my',
    tarikh: '02/01/2026 04:45 PM',
    selangMasa: '1 hari lalu',
  },
]

/**
 * Get paginated list of activity logs for the Log Aktiviti page.
 * TODO: replace mock data with a real API call (e.g. GET /audit-logs) once the
 * backend endpoint is available. The response shape below is designed to match
 * that future endpoint so callers won't need to change.
 */
export const getLogAktivitiList = async (
  params: GetLogAktivitiListParams = {}
): Promise<GetLogAktivitiListResponse> => {
  const { page = 1, limit = 15 } = params

  try {
    const totalItems = mockLogs.length
    const totalPages = Math.max(1, Math.ceil(totalItems / limit))
    const startIndex = (page - 1) * limit
    const items = mockLogs.slice(startIndex, startIndex + limit)

    return {
      items,
      meta: {
        currentPage: page,
        pageSize: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    }
  } catch (error) {
    console.error('Error fetching log aktiviti list:', error)
    throw error
  }
}
