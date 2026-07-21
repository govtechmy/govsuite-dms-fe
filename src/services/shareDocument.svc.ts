import { getEnv } from '@/config/runtimeEnv'
import { authAxios } from './http'

export interface ShareUser {
  fullName: string
  email: string
}

export interface ShareUserGroup {
  fullName: string
  email: string
  users: string[]
  username: string
  unitId: string
}

export const getAvailableUsers = async (recordId: string): Promise<ShareUser[]> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/record-share/available/${recordId}`

  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data

    return Array.isArray(payload) ? payload : []
  } catch (error) {
    console.error('Error getting available users:', error)
    throw error
  }
}

export const getAvailableUserGroups = async (recordId: string): Promise<ShareUserGroup[]> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/record-share/available-group/${recordId}`

  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data

    return Array.isArray(payload) ? payload : []
  } catch (error) {
    console.error('Error getting available user groups:', error)
    throw error
  }
}

export const getCurrentApprovedUsers = async (recordId: string): Promise<ShareUser[]> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/record-share/permitted/${recordId}`

  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data

    return Array.isArray(payload) ? payload : []
  } catch (error) {
    console.error('Error getting current approved users:', error)
    throw error
  }
}

export const shareSpecificRecord = async (
  recordId: string,
  users: string[]
): Promise<ShareUser[]> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/record-share/add/${recordId}`

  try {
    const response = await authAxios.post(url, { users })
    const payload = response.data?.data ?? response.data

    return Array.isArray(payload) ? payload : []
  } catch (error) {
    console.error('Error sharing specific record:', error)
    throw error
  }
}

export const removeRecordSharing = async (
  recordId: string,
  users: string[]
): Promise<ShareUser[]> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/record-share/remove/${recordId}`

  try {
    const response = await authAxios.delete(url, { data: { users } })
    const payload = response.data?.data ?? response.data

    return Array.isArray(payload) ? payload : []
  } catch (error) {
    console.error('Error removing record sharing:', error)
    throw error
  }
}
