import { getEnv } from '@/config/runtimeEnv'
import { authAxios } from './http'

type GetPdfGarageParams = {
  id: string
}

export interface PdfGarageMeta {
  fileName: string
  fileType: string
  fileExtension: string
  fileSize: number
}

export interface PdfGarageDocument {
  type?: string
  id?: string
  recordId?: string
  folderId?: string
  fileName?: string
  status?: string
  accessLevel: string
  recordDate: string
  recordTitle: string
  unit: string
  path?: string
  documentProfile?: string
  documentProfileCode?: string
}

export type PdfGarageRecordMetadata = Record<string, unknown>

export interface PdfGarageBase {
  url: string
  document: PdfGarageDocument
  recordMetadata: PdfGarageRecordMetadata
  meta: PdfGarageMeta
}

export interface PdfGarageError {
  code: string
  message: string
}

interface GetPdfGarageSuccessResponse {
  success: true
  data: PdfGarageBase
}

interface GetPdfGarageErrorResponse {
  success: false
  error: PdfGarageError
}

type GetPdfGarageResponse = GetPdfGarageSuccessResponse | GetPdfGarageErrorResponse

export type GetPdfGarageResult = GetPdfGarageResponse

export const getPdfGarage = async ({ id }: GetPdfGarageParams): Promise<GetPdfGarageResult> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/record/download-url/${id}`

  try {
    const response = await authAxios.get<GetPdfGarageResponse>(url)
    const payload = response.data

    if (payload.success) {
      return payload
    }

    return {
      success: false,
      error: payload.error,
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'REQUEST_FAILED',
        message: error instanceof Error ? error.message : 'Failed to fetch PDF download URL',
      },
    }
  }
}
