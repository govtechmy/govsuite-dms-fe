import { getEnv } from '@/config/runtimeEnv'
import { authAxios } from './http'

interface ResendRecordData {
  message: string
  workflowState: string
}

export const deleteRecord = async (recordId: string): Promise<ResendRecordData> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/record/${recordId}`
  try {
    const response = await authAxios.delete<ResendRecordData>(url)
    return response.data
  } catch (error) {
    console.error('Error deleting record:', error)
    throw error
  }
}

export const resendRecord = async (recordId: string): Promise<ResendRecordData> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/record/workflow/${recordId}`
  const body = {
    workflowState: 'DALAM_SEMAKAN',
  }

  try {
    const response = await authAxios.put<ResendRecordData>(url, body)
    return response.data
  } catch (error) {
    console.error('Error resending record workflow:', error)
    throw error
  }
}
