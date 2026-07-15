import axios from 'axios'
import { getEnv } from '@/config/runtimeEnv'
import { authAxios } from './http'
import extractBackendError from '@/utils/extractBackendError'

// Profile Document Config by ID
export interface MetadataField {
  key: string
  title: string
  type: string
  required: boolean
}

export interface ProfileDocumentConfig {
  definitionGroupId: string
  unitId: string
  allowedFormats: string[]
  maxFileSizeMb: number
  requiredMetadata: MetadataField[]
  additionalMetadata: MetadataField[]
  workflowCode: string
  documentProfileCode: string
  documentProfileName: string
  isLatest: boolean
  createdAt: string
  updatedAt: string
  retentionPeriod: string
}

// Metadata Config
export interface MetadataConfigField {
  key: string
  title: string
  type: string
  required: boolean
}

export interface MetadataConfig {
  requiredMetadata: MetadataConfigField[]
  additionalMetadata: MetadataConfigField[]
}

// Presigned Upload
export interface PresignUploadRequest {
  fileName: string
  fileType: string
  fileExtension: string
  fileSize: number
  recordConfig: string
  recordDate: string
}

export interface PresignUploadResponse {
  presignedUrl: string
  recordId: string
  fileName: string
  fileType: string
  fileExtension: string
  fileSize: number
}

// Upload Status
export interface UploadStatusResponse {
  exists: boolean
}

// Save Record
export interface SaveUploadRecordRequest {
  recordId: string
  fileName: string
  fileType: string
  fileExtension: string
  fileSize: number
  folderId: string
  title: string
  recordDescription?: string
  recordDate: string
  reference?: string
  unitId: string
  year: number
  classification?: string
  accessLevel: string
  retentionPeriod?: string
  isLatest: boolean
  metadata: Record<string, unknown>
  recordConfig: string
  status: string
}

export interface SaveUploadRecordResponse {
  recordId: string
  id?: string
}

// Download URL (delegated to pdf.svc but re-exported for upload context)
export interface DownloadUrlResponse {
  url: string
  meta: {
    fileName: string
    fileType: string
    fileExtension: string
    fileSize: number
  }
  document: {
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
    documentProfileCode?: string
    documentProfile?: string
  }
  recordMetadata?: Record<string, unknown>
}

/**
 * Get profile document configuration by profile ID
 * GET /config/profile-document-id/{profileId}
 */
export const getProfileDocumentConfig = async (
  profileId: string
): Promise<ProfileDocumentConfig | null> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/config/profile-document-id/${profileId}`

  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data

    if (!payload) {
      return null
    }

    return {
      definitionGroupId: String(payload.definitionGroupId ?? ''),
      unitId: String(payload.unitId ?? ''),
      allowedFormats: Array.isArray(payload.allowedFormats) ? payload.allowedFormats : [],
      maxFileSizeMb: Number(payload.maxFileSizeMb ?? 0),
      requiredMetadata: Array.isArray(payload.requiredMetadata) ? payload.requiredMetadata : [],
      additionalMetadata: Array.isArray(payload.additionalMetadata)
        ? payload.additionalMetadata
        : [],
      workflowCode: String(payload.workflowCode ?? ''),
      documentProfileCode: String(payload.documentProfileCode ?? ''),
      documentProfileName: String(payload.documentProfileName ?? ''),
      isLatest: Boolean(payload.isLatest),
      createdAt: String(payload.createdAt ?? ''),
      updatedAt: String(payload.updatedAt ?? ''),
      retentionPeriod: String(payload.retentionPeriod ?? ''),
    }
  } catch (error) {
    console.error(`Error fetching profile document config for ID ${profileId}:`, error)
    throw error
  }
}

/**
 * Get metadata configuration by profile ID
 * GET /config/metadata/{profileId}
 */
export const getMetadataConfig = async (profileId: string): Promise<MetadataConfig | null> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/config/metadata/${profileId}`

  try {
    const response = await authAxios.get(url)
    console.log(response)
    const payload = response.data?.data ?? response.data

    if (!payload) {
      return null
    }

    return {
      requiredMetadata: Array.isArray(payload.requiredMetadata) ? payload.requiredMetadata : [],
      additionalMetadata: Array.isArray(payload.additionalMetadata)
        ? payload.additionalMetadata
        : [],
    }
  } catch (error) {
    console.error(`Error fetching metadata config for profile ${profileId}:`, error)
    throw error
  }
}

/**
 * Request presigned upload URL
 * POST /record/presign/upload
 */
export const requestPresignedUploadUrl = async (
  body: PresignUploadRequest
): Promise<PresignUploadResponse> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/record/presign/upload`

  try {
    const response = await authAxios.post(url, body)
    const payload = response.data?.data ?? response.data ?? {}

    return {
      presignedUrl: String(payload.presignedUrl ?? ''),
      recordId: String(payload.recordId ?? ''),
      fileName: String(payload.fileName ?? ''),
      fileType: String(payload.fileType ?? ''),
      fileExtension: String(payload.fileExtension ?? ''),
      fileSize: Number(payload.fileSize ?? 0),
    }
  } catch (error) {
    console.error('Error requesting presigned upload URL:', error)
    throw error
  }
}

/**
 * Upload file to presigned S3 URL
 * PUT to presigned URL (direct S3, no auth headers)
 */
export const uploadFileToPresignedUrl = async ({
  presignedUrl,
  file,
  fileType,
  onUploadProgress,
}: {
  presignedUrl: string
  file: File | Blob
  fileType: string
  onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
}): Promise<void> => {
  try {
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': fileType,
      },
      onUploadProgress,
    })
  } catch (error) {
    console.error('Error uploading file to presigned URL:', error)
    throw error
  }
}

/**
 * Check upload status by record ID
 * GET /record/upload/status?recordId={recordId}
 */
export const getUploadStatus = async (recordId: string): Promise<UploadStatusResponse> => {
  const params = new URLSearchParams({ recordId })
  const url = `${getEnv('VITE_API_BASE_URL')}/record/upload/status?${params.toString()}`

  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data ?? {}

    return {
      exists: Boolean(payload.exists),
    }
  } catch (error) {
    console.error(`Error checking upload status for record ${recordId}:`, error)
    throw error
  }
}

/**
 * Save uploaded record in database
 * POST /record/upload/save
 */
export const saveUploadedRecord = async (
  body: SaveUploadRecordRequest
): Promise<SaveUploadRecordResponse> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/record/upload/save`

  try {
    const response = await authAxios.post(url, body)
    const payload = response.data?.data ?? response.data ?? {}

    return {
      recordId: String(payload.recordId ?? ''),
      id: payload.id ? String(payload.id) : undefined,
    }
  } catch (error) {
    console.error('Error saving uploaded record:', error)
    throw error
  }
}

/**
 * Update existing uploaded record in database
 * PUT /record/{mongoDbRecordId}
 */

export const updateUploadedRecord = async (
  body: SaveUploadRecordRequest,
  mongoDbRecordId: string
): Promise<SaveUploadRecordResponse> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/record/${mongoDbRecordId}`

  try {
    const response = await authAxios.put(url, body)
    const payload = response.data?.data ?? response.data ?? {}

    return {
      recordId: String(payload.recordId ?? ''),
      id: payload.id ? String(payload.id) : undefined,
    }
  } catch (error) {
    console.error('Error updating uploaded record:', error)
    throw error
  }
}

/**
 * Save or update uploaded record with automatic fallback
 * Tries POST first, falls back to PUT if record already exists
 */
export const saveOrUpdateUploadedRecord = async (
  body: SaveUploadRecordRequest,
  mongoDbRecordId?: string
): Promise<SaveUploadRecordResponse> => {
  try {
    return await saveUploadedRecord(body)
  } catch (error) {
    const backendError = extractBackendError(error)

    // Check for duplicate error (prefer code match, fallback to message)
    const isDuplicateError =
      backendError?.code === 'RECORD_ALREADY_EXISTS' ||
      backendError?.message?.toLowerCase().includes('already exists')

    if (isDuplicateError && mongoDbRecordId) {
      return await updateUploadedRecord(body, mongoDbRecordId)
    }

    // Re-throw non-duplicate errors
    throw error
  }
}

/**
 * Download record file by record ID
 * GET /record/download/{recordId}
 */
export const downloadRecord = async (recordId: string): Promise<Blob> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/record/download/${recordId}`

  try {
    const response = await authAxios.get(url, {
      responseType: 'blob',
    })

    return response.data
  } catch (error) {
    console.error(`Error downloading record ${recordId}:`, error)
    throw error
  }
}
