import { getEnv } from '@/config/runtimeEnv'
import { unauthAxios } from './http'

export interface PdfConvertResult {
  success: boolean
  // Only sent with ?includeHtml=true; page HTML otherwise comes from getPdfConvertPages
  data?: string
  html?: string
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

export interface PdfConvertPage {
  page: number
  html: string
  width: number
  height: number
}

export interface PdfConvertPagesMeta {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PdfConvertPagesResponse {
  items: PdfConvertPage[]
  baseStyle: PdfConvertResult['baseStyle']
  meta: PdfConvertPagesMeta
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

/**
 * Fetch a completed job's converted pages in chunks; each item is one PDF page.
 * GET /api/result/:jobId?page=&pageSize=
 */
export const getPdfConvertPages = async (
  jobId: string,
  params: { page: number; pageSize: number }
): Promise<PdfConvertPagesResponse> => {
  const url = `${getEnv('VITE_PDF_SERVICE_URL')}/api/result/${encodeURIComponent(jobId)}`
  const response = await unauthAxios.get<PdfConvertPagesResponse>(url, { params })
  return response.data
}
