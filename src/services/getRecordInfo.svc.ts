import { getEnv } from '@/config/runtimeEnv'
import { authAxios } from './http'

export const getRecordInfo = async (recordId: string) => {
  const url = `${getEnv('VITE_API_BASE_URL')}/record/${recordId}`
  try {
    const response = await authAxios.get(url)
    return response.data
  } catch (error) {
    console.error('Error deleting record:', error)
    throw error
  }
}
