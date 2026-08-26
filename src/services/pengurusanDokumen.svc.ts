/**
 * Service layer for the "Pengurusan Dokumen" (document settings) catalog.
 */

import { authAxios } from './http'
import { getEnv } from '@/config/runtimeEnv'

/**
 * Summary of an organizational unit's document settings ("Tetapan"),
 * used to render the top-level accordion list.
 */
export interface PengurusanUnitSummary {
  key: string
  value: string
  count: number
}

/**
 * A single document profile setting ("Tetapan") belonging to a unit.
 */
export interface PengurusanTetapanItem {
  documentProfileId: string
  documentProfileCode: string
  documentProfileName: string
  updatedAt: string
  isActive: boolean
}

/**
 * A single toggleable field within a document profile's config
 * (used for both "Medan Wajib" checklist).
 */
export interface PengurusanDokumenMetadataField {
  key: string
  title: string
  type: string
  required: boolean
  value: boolean
  isFixed: boolean
}

/**
 * Lookup option shape shared by defaultAccessLevel/retentionPeriod.
 */
export interface PengurusanDokumenLookupOption {
  code: string
  codeName: string
}

/**
 * Full document profile config ("Tetapan"), used to prefill the
 * Tambah/Kemaskini Tetapan form.
 */
export interface PengurusanDokumenConfig {
  definitionGroupId: string
  unitId: string
  allowedFormats: string[]
  maxFileSizeMb: number
  workflowCode: string
  documentProfileCode: string
  documentProfileName: string
  defaultAccessLevel: PengurusanDokumenLookupOption
  retentionPeriod: PengurusanDokumenLookupOption
  isLatest: boolean
  createdAt: string
  updatedAt: string
  metadataFields: PengurusanDokumenMetadataField[]
}

/**
 * Get the list of units with their document settings ("Tetapan") count,
 * used to render the top-level accordion.
 * GET /config/unit
 */
export const getPengurusanUnitsSummary = async (): Promise<PengurusanUnitSummary[]> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/config/unit`
  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data?.items

    return Array.isArray(payload) ? payload : []
  } catch (error) {
    console.error('Error fetching pengurusan units summary:', error)
    throw error
  }
}

/**
 * Get the list of document settings ("Tetapan") belonging to a unit,
 * fetched lazily when its accordion item is expanded.
 * GET /config/unit/{unitKey}
 */
export const getPengurusanTetapanByUnit = async (
  unitKey: string
): Promise<PengurusanTetapanItem[]> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/config/unit/${unitKey}`
  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data

    return Array.isArray(payload) ? payload : []
  } catch (error) {
    console.error(`Error fetching pengurusan tetapan for unit ${unitKey}:`, error)
    throw error
  }
}

/**
 * Get the full config for a single document profile setting ("Tetapan"),
 * used to prefill the Tambah/Kemaskini Tetapan form. Pass "draf" as the
 * id when creating a brand new setting from the "Tambah Tetapan" flow.
 * GET /config/{documentProfileId}
 */
export const getPengurusanDokumenConfig = async (
  documentProfileId: string
): Promise<PengurusanDokumenConfig | null> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/config/${documentProfileId}`
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
      workflowCode: String(payload.workflowCode ?? ''),
      documentProfileCode: String(payload.documentProfileCode ?? ''),
      documentProfileName: String(payload.documentProfileName ?? ''),
      defaultAccessLevel: {
        code: String(payload.defaultAccessLevel?.code ?? ''),
        codeName: String(payload.defaultAccessLevel?.codeName ?? ''),
      },
      retentionPeriod: {
        code: String(payload.retentionPeriod?.code ?? ''),
        codeName: String(payload.retentionPeriod?.codeName ?? ''),
      },
      isLatest: Boolean(payload.isLatest),
      createdAt: String(payload.createdAt ?? ''),
      updatedAt: String(payload.updatedAt ?? ''),
      metadataFields: Array.isArray(payload.metadataFields) ? payload.metadataFields : [],
    }
  } catch (error) {
    console.error(`Error fetching pengurusan dokumen config for id ${documentProfileId}:`, error)
    throw error
  }
}
