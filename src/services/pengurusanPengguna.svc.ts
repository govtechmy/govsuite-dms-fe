import { getEnv } from '@/config/runtimeEnv'
import { authAxios } from './http'

export interface PenggunaListMeta {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PenggunaItem {
  id: string
  username: string
  email: string
  fullName: string
  status: string
  unitId: string
  roles: string[]
  mustChangePassword: boolean
  disabledResetPassword?: boolean
  lastLoginAt?: string
}

export interface GetPenggunaListParams {
  query?: string
  unit?: string
  role?: string
  page?: number
  limit?: number
}

export interface GetPenggunaListResponse {
  items: PenggunaItem[]
  meta: PenggunaListMeta
}

export interface PenggunaPayload {
  fullName: string
  email: string
  unitId: string
  roles: string[]
  // userAccessLevel requirement isn't finalised by backend yet — re-enable once ready.
  // userAccessLevel: string[]
}

export type CreatePenggunaPayload = PenggunaPayload
export type UpdatePenggunaPayload = PenggunaPayload

/**
 * Get list of pengguna (users) for the Pengurusan Pengguna page.
 * GET /users
 */
export const getPenggunaList = async (
  params: GetPenggunaListParams = {}
): Promise<GetPenggunaListResponse> => {
  const { query = '', unit = '', role = '', page = 1, limit = 15 } = params

  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  if (query) {
    searchParams.set('search', query)
  }

  if (unit) {
    searchParams.set('unit', unit)
  }

  if (role) {
    searchParams.set('roles', role)
  }

  const url = `${getEnv('VITE_API_BASE_URL')}/users?${searchParams.toString()}`

  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data ?? {}
    const items: PenggunaItem[] = Array.isArray(payload?.items) ? payload.items : []
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
    console.error('Error fetching pengguna list:', error)
    throw error
  }
}

/**
 * Create a new pengguna (user) from the "Tambah Pengguna" modal.
 * POST /users
 */
export const createPengguna = async (payload: CreatePenggunaPayload): Promise<PenggunaItem> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/users`

  try {
    const response = await authAxios.post(url, payload)
    return response.data?.data ?? response.data
  } catch (error) {
    console.error('Error creating pengguna:', error)
    throw error
  }
}

/**
 * Update an existing pengguna (user) from the "Edit Pengguna" modal.
 * PUT /users/:id
 */
export const updatePengguna = async (
  id: string,
  payload: UpdatePenggunaPayload
): Promise<PenggunaItem> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/users/${id}`

  try {
    const response = await authAxios.put(url, payload)
    return response.data?.data ?? response.data
  } catch (error) {
    console.error('Error updating pengguna:', error)
    throw error
  }
}

export interface EmailAvailability {
  available: boolean
  message: string
}

/**
 * Check whether an email is available for use, called from the "Tambah Pengguna"
 * modal while the user is typing (debounced) to give live feedback before submit.
 * GET /users/validate-email?email=...
 *
 * Throws on failure (e.g. email already exists as a CONFLICT) — the caller is
 * responsible for interpreting the error via `extractBackendError`.
 */
export const checkEmailAvailability = async (email: string): Promise<EmailAvailability> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/users/validate-email`

  const response = await authAxios.get(url, { params: { email } })
  const message =
    typeof response.data?.data === 'string' ? response.data.data : 'Email is available'

  return { available: true, message }
}

export interface DeletePenggunaResponse {
  id: string
  deletedAt: string
}

/**
 * Delete an existing pengguna (user) from the "Buang Pengguna" confirmation step.
 * DELETE /users/:id
 */
export const deletePengguna = async (id: string): Promise<DeletePenggunaResponse> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/users/${id}`

  try {
    const response = await authAxios.delete(url)
    return response.data?.data ?? response.data
  } catch (error) {
    console.error('Error deleting pengguna:', error)
    throw error
  }
}

export interface ResetPenggunaPasswordResponse {
  message: string
}

/**
 * Reset an existing pengguna's password from the "Reset Kata Laluan" confirmation step.
 * PATCH /users/reset-password/:id
 */
export const resetPenggunaPassword = async (id: string): Promise<ResetPenggunaPasswordResponse> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/users/reset-password/${id}`

  try {
    const response = await authAxios.patch(url)
    return response.data?.data ?? response.data
  } catch (error) {
    console.error('Error resetting pengguna password:', error)
    throw error
  }
}
