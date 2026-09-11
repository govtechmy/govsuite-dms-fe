import { authAxios } from './http'
import { getEnv } from '@/config/runtimeEnv'

export interface ToggleFavoriteResult {
  action: 'added' | 'removed'
  message: string
  recordId: string
  title?: string
  fileName?: string
  createdAt?: string
  updatedAt?: string
}

export interface FavoriteStatus {
  recordId: string
  favorite: boolean
}

/**
 * Add or remove a record from the current user's favourites.
 * POST /favorite/toggle
 */
export const postToggleFavorite = async (recordId: string): Promise<ToggleFavoriteResult> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/favorite/toggle`
  try {
    const response = await authAxios.post(url, { recordId })
    const payload = response.data?.data ?? response.data

    if (!payload?.action || !payload?.recordId) {
      throw new Error('Invalid response payload: missing action or recordId')
    }

    return payload
  } catch (error) {
    console.error('Error toggling favorite : ', error)
    throw error
  }
}

/**
 * Check whether a record is in the current user's favourites.
 * GET /favorite/:recordId
 */
export const getFavoriteStatus = async (recordId: string): Promise<FavoriteStatus> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/favorite/${recordId}`
  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data

    return {
      recordId: payload?.recordId ?? recordId,
      favorite: Boolean(payload?.favorite),
    }
  } catch (error) {
    console.error('Error fetching favorite status : ', error)
    throw error
  }
}
