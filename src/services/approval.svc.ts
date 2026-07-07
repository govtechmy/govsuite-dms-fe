import { getEnv } from '@/config/runtimeEnv'
import { authAxios } from './http'

interface PutDocumentNotApprovedParams {
  recordId: string
  body: {
    reason: string
  }
}

interface WorkflowStateUpdateData {
  message: string
  workflowState: string
}

interface NotApprovedWorkflowStateUpdateData {
  message: string
  workflowState: string
  rejectReason?: {
    LAIN_LAIN?: string
    TIDAK_LENGKAP?: boolean
    TIDAK_TEPAT?: boolean
  }
}

export const putDocumentApproval = async (recordId: string): Promise<WorkflowStateUpdateData> => {
  try {
    const url = `${getEnv('VITE_API_BASE_URL')}/record/approved/${recordId}`
    const response = await authAxios.put<WorkflowStateUpdateData>(url)
    return response.data
  } catch (error) {
    console.error('Error approving document:', error)
    throw error
  }
}

export const putDocumentNotApproved = async ({
  recordId,
  body,
}: PutDocumentNotApprovedParams): Promise<NotApprovedWorkflowStateUpdateData> => {
  try {
    const url = `${getEnv('VITE_API_BASE_URL')}/record/rejected/${recordId}`

    const response = await authAxios.put<NotApprovedWorkflowStateUpdateData>(url, body)
    return response.data
  } catch (error) {
    console.error('Error rejecting document:', error)
    throw error
  }
}
