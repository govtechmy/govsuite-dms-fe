import { authAxios } from './http'
import { getEnv } from '@/config/runtimeEnv'

/**
 * Organizational unit option for filter dropdowns
 */
export interface DropdownUnit {
  code: string
  codeName: string
}

/**
 * Document type/profile option for filter dropdowns
 */
export interface DropdownJenisDokumen {
  id: string
  code: string
  codeName: string
  definitionGroupId?: string // Backend currently names this definitionGroupId; used as recordConfig
}

/**
 * Access/security level option for upload forms
 */
export interface AccessLevel {
  id: string
  code: string
  codeName: string
}

/**
 * User role option for filter dropdowns (Peranan Pengguna)
 */
export interface DropdownUserRole {
  code: string
  name: string
  description: string
}

/**
 * Retention period option for document settings (Tempoh Simpanan)
 */
export interface RetentionPeriod {
  id: string
  code: string
  codeName: string
}

/**
 * Profile document option for upload forms (unit-specific)
 */
export interface ProfileDocument {
  id: string
  definitionGroupId: string
  unitId: string
  workflowCode: string
  documentProfileCode: string
  documentProfile: string
  defaultAccessLevel?: string
}

/**
 * Response wrapper for profile documents by unit
 */
export interface ProfileDocumentsByUnitResponse {
  items: ProfileDocument[]
}

/**
 * Get list of document types/profiles for filter dropdowns
 * GET /lookup/profile
 */
export const getDropdownJenisDokumen = async (): Promise<DropdownJenisDokumen[]> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/lookup/profile`
  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data
    return Array.isArray(payload) ? payload : []
  } catch (error) {
    console.error('Error fetching dropdown jenis dokumen : ', error)
    throw error
  }
}

/**
 * Get list of organizational units for filter dropdowns for all
 * GET /units
 */
export const getDropdownUnits = async (): Promise<DropdownUnit[]> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/units`
  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data
    return Array.isArray(payload) ? payload : []
  } catch (error) {
    console.error('Error fetching dropdown units : ', error)
    throw error
  }
}

/**
 * Get list of organizational units for filter dropdowns for permissible user
 * GET /units
 */

/**
 * Get list of profile documents by unit code
 * GET /config/profile-document/{unitCode}
 */
export const getProfileDocumentsByUnit = async (unitCode: string): Promise<ProfileDocument[]> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/config/profile-document/${unitCode}`

  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data
    const items: ProfileDocument[] = Array.isArray(payload) ? payload : []

    return items
  } catch (error) {
    console.error(`Error fetching profile documents for unit ${unitCode}:`, error)
    throw error
  }
}

/**
 * Get list of access levels for upload forms
 * GET /lookup/access-level
 */
export const getAccessLevels = async (): Promise<AccessLevel[]> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/lookup/access-level`

  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data

    return Array.isArray(payload) ? payload : []
  } catch (error) {
    console.error('Error fetching access levels:', error)
    throw error
  }
}

/**
 * Get list of retention periods for document settings (Tempoh Simpanan)
 * GET /lookup/retention-period
 */
export const getRetentionPeriods = async (): Promise<RetentionPeriod[]> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/lookup/retention-period`

  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data

    return Array.isArray(payload) ? payload : []
  } catch (error) {
    console.error('Error fetching retention periods:', error)
    throw error
  }
}

/**
 * Get list of user roles for filter dropdowns (Peranan Pengguna)
 * GET /roles
 */
export const getUserRoles = async (): Promise<DropdownUserRole[]> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/roles`

  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data

    return Array.isArray(payload) ? payload : []
  } catch (error) {
    console.error('Error fetching user roles:', error)
    throw error
  }
}
