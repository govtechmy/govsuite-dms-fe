import { getEnv } from '@/config/runtimeEnv'
import { authAxios } from './http'

export interface MetadataRecordData {
  path?: string
  documentProfile?: string
  recordDescription?: string
  accessLevel?: string
  unit?: string
  [key: string]: unknown
}

export interface MetadataItem {
  key?: string
  title: string
  type?: string
  required?: string
  value: string
}

export interface MetadataDocument {
  recordData: MetadataRecordData
  requiredMetadata: MetadataItem[]
  metadata: MetadataItem[]
}

export const getMetadata = async ({
  recordId,
}: {
  recordId: string
}): Promise<MetadataDocument | null> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/record/metadata/${recordId}`
  try {
    const response = await authAxios.get(url)
    const payload = response?.data?.data

    if (!payload) {
      return null
    }

    return {
      recordData: payload.recordData ?? {},
      requiredMetadata: payload.requiredMetadata ?? [],
      metadata: payload.metadata ?? [],
    }
  } catch (error) {
    console.error('Error fetching Metadata : ', error)
    throw error
  }
}
