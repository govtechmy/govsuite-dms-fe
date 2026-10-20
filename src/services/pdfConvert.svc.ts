import { getEnv } from '@/config/runtimeEnv'
import { unauthAxios } from './http'

export interface PdfConvertResult {
  success: boolean
  data: string
  html: string
  baseStyle?: {
    fontFamily?: string | null
    fontSize?: string | null
    color?: string | null
  }
  pageSizes?: { page: number; width: number; height: number }[]
  pages?: number
  filename?: string
  convertedAt?: string
}

export interface PdfUploadResponse {
  jobId: string
  status: string
  message: string
}

export interface PdfConvertStatusResponse {
  jobId: string
  status: 'processing' | 'completed' | 'failed'
  result?: PdfConvertResult | null
  error?: string | null
}

/**
 * Upload a PDF to the PDF conversion FastAPI service; conversion runs as a background job.
 * POST /api/upload
 */
export const postPdfConvert = async (file: Blob, fileName: string): Promise<PdfUploadResponse> => {
  const url = `${getEnv('VITE_PDF_SERVICE_URL')}/api/upload`
  const formData = new FormData()
  formData.append('file', file, fileName)

  const response = await unauthAxios.post<PdfUploadResponse>(url, formData)
  return response.data
}

/**
 * Check the status of a PDF conversion job; `result.html` is set once completed.
 * GET /api/validation-status/:jobId
 */
export const getPdfConvertStatus = async (jobId: string): Promise<PdfConvertStatusResponse> => {
  const url = `${getEnv('VITE_PDF_SERVICE_URL')}/api/validation-status/${encodeURIComponent(jobId)}`
  const response = await unauthAxios.get<PdfConvertStatusResponse>(url)
  return response.data
}
