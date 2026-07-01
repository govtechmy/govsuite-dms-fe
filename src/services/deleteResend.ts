import { getEnv } from '@/config/runtimeEnv'
import { authAxios } from './http'

// {
//   "success": false,
//   "error": {
//     "code": "BAD_REQUEST",
//     "message": "Cannot set workflow state to 'DALAM_SEMAKAN' due to existing workflow step. Please use the appropriate workflow."
//   }
// }

// {
//   "success": true,
//   "data": {
//     "message": "Record 1782801959445_6a43662708b762d3354f6a92 workflow state updated from 'TIDAK_DILULUSKAN' to 'DALAM_SEMAKAN'",
//     "workflowState": "DALAM_SEMAKAN"
//   }
// }

interface ResendRecordData {
  message: string
  workflowState: string
}

interface ResendRecordError {
  code: string
  message: string
}

interface ResendRecordResponse {
  success: boolean
  data?: ResendRecordData
  error?: ResendRecordError
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// export const deleteRecord = async (recordId: string): Promise<> => {
//   const url = `${getEnv('VITE_API_BASE_URL')}/record/approved/${recordId}`
//   const response = await authAxios.delete<>(url)
//   return response.data
// }

export const resendRecord = async (recordId: string): Promise<ResendRecordResponse> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/record/workflow/${recordId}`
  const body = {
    workflowState: 'DALAM_SEMAKAN',
  }
  const response = await authAxios.put<ResendRecordResponse>(url, body)

  await wait(4000)

  return response.data
}
