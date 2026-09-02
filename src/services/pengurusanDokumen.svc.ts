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
  definitionGroupId: string
  unitId: string
  documentProfileCode: string
  documentProfileName: string
  updatedAt: string
  configStatus: string
  version: number
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
 * A single toggleable file format within a document profile's config
 * (used for the "Validasi Fail" checklist).
 */
export interface PengurusanDokumenFormatField {
  key: string
  title: string
  value: boolean
  isFixed: boolean
}

/**
 * Full document profile config ("Tetapan"), used to prefill the
 * Tambah/Kemaskini Tetapan form.
 */
export interface PengurusanDokumenConfig {
  definitionGroupId: string
  unitId: string
  allowedFormats: PengurusanDokumenFormatField[]
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
 * Request body shared by create (POST) and update (PUT) config calls.
 * `defaultAccessLevel`/`retentionPeriod` are sent as lookup codes (e.g.
 * "TERBUKA"), not the `{code, codeName}` objects returned by the GET.
 */
export interface PengurusanDokumenConfigPayload {
  workflowCode: string
  documentProfileCode: string
  documentProfileName: string
  defaultAccessLevel: string
  retentionPeriod: string
  allowedFormats: PengurusanDokumenFormatField[]
  maxFileSizeMb: number
  metadataFields: PengurusanDokumenMetadataField[]
}

/**
 * Create payload additionally requires the unit, since a new setting
 * ("generation") is being created for that unit.
 */
export interface CreatePengurusanDokumenConfigPayload extends PengurusanDokumenConfigPayload {
  unitId: string
}

export interface CreatePengurusanDokumenConfigResult {
  message: string
  definitionGroupId: string
  existingDefinitionGroupId: string | null
  documentProfileCode: string
}

export interface UpdatePengurusanDokumenConfigResult {
  message: string
  definitionGroupId: string
  documentProfileCode: string
}

/**
 * Create a new document profile setting ("Tetapan") for a unit, used by
 * the "Tambah Tetapan" flow.
 * POST /config/
 */
export const createPengurusanDokumenConfig = async (
  payload: CreatePengurusanDokumenConfigPayload
): Promise<CreatePengurusanDokumenConfigResult> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/config/`
  try {
    const response = await authAxios.post(url, payload)
    const data = response.data?.data ?? response.data

    return {
      message: String(data?.message ?? ''),
      definitionGroupId: String(data?.definitionGroupId ?? ''),
      existingDefinitionGroupId:
        typeof data?.existingDefinitionGroupId === 'string' ? data.existingDefinitionGroupId : null,
      documentProfileCode: String(data?.documentProfileCode ?? ''),
    }
  } catch (error) {
    console.error('Error creating pengurusan dokumen config:', error)
    throw error
  }
}

/**
 * Update an existing document profile setting ("Tetapan") in place, used
 * by the "Kemaskini Tetapan" flow.
 * PUT /config/{documentProfileId}
 */
export const updatePengurusanDokumenConfig = async (
  documentProfileId: string,
  payload: PengurusanDokumenConfigPayload
): Promise<UpdatePengurusanDokumenConfigResult> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/config/${documentProfileId}`
  try {
    const response = await authAxios.put(url, payload)
    const data = response.data?.data ?? response.data

    return {
      message: String(data?.message ?? ''),
      definitionGroupId: String(data?.definitionGroupId ?? ''),
      documentProfileCode: String(data?.documentProfileCode ?? ''),
    }
  } catch (error) {
    console.error(`Error updating pengurusan dokumen config for id ${documentProfileId}:`, error)
    throw error
  }
}

/**
 * Shared response parser for both the by-id and default config endpoints,
 * which return an identical shape.
 */
const parsePengurusanDokumenConfig = (
  payload: Record<string, unknown> | null | undefined
): PengurusanDokumenConfig | null => {
  if (!payload) {
    return null
  }

  const defaultAccessLevel = payload.defaultAccessLevel as
    { code?: unknown; codeName?: unknown } | undefined
  const retentionPeriod = payload.retentionPeriod as
    { code?: unknown; codeName?: unknown } | undefined

  return {
    definitionGroupId: String(payload.definitionGroupId ?? ''),
    unitId: String(payload.unitId ?? ''),
    allowedFormats: Array.isArray(payload.allowedFormats) ? payload.allowedFormats : [],
    maxFileSizeMb: Number(payload.maxFileSizeMb ?? 0),
    workflowCode: String(payload.workflowCode ?? ''),
    documentProfileCode: String(payload.documentProfileCode ?? ''),
    documentProfileName: String(payload.documentProfileName ?? ''),
    defaultAccessLevel: {
      code: String(defaultAccessLevel?.code ?? ''),
      codeName: String(defaultAccessLevel?.codeName ?? ''),
    },
    retentionPeriod: {
      code: String(retentionPeriod?.code ?? ''),
      codeName: String(retentionPeriod?.codeName ?? ''),
    },
    isLatest: Boolean(payload.isLatest),
    createdAt: String(payload.createdAt ?? ''),
    updatedAt: String(payload.updatedAt ?? ''),
    metadataFields: Array.isArray(payload.metadataFields) ? payload.metadataFields : [],
  }
}

/**
 * Get the full config for a single document profile setting ("Tetapan"),
 * used to prefill the Kemaskini Tetapan form by its record id.
 * GET /config/{documentProfileId}
 */
export const getPengurusanDokumenConfig = async (
  documentProfileId: string
): Promise<PengurusanDokumenConfig | null> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/config/${documentProfileId}`
  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data

    return parsePengurusanDokumenConfig(payload)
  } catch (error) {
    console.error(`Error fetching pengurusan dokumen config for id ${documentProfileId}:`, error)
    throw error
  }
}

/**
 * Get the default/base config for a document profile code, used to prefill
 * the Tambah Tetapan form once a Profil Dokumen is selected.
 * GET /config/default/{documentProfileCode}
 */
export const getPengurusanDokumenDefaultConfig = async (
  documentProfileCode: string
): Promise<PengurusanDokumenConfig | null> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/config/default/${documentProfileCode}`
  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data

    return parsePengurusanDokumenConfig(payload)
  } catch (error) {
    console.error(
      `Error fetching pengurusan dokumen default config for code ${documentProfileCode}:`,
      error
    )
    throw error
  }
}
