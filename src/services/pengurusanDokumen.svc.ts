/**
 * Service layer for the "Pengurusan Dokumen" (document settings) catalog.
 *
 * NOTE: The backend endpoints for this feature are not available yet.
 * Both functions below return mocked data behind a simulated network delay
 * so loading states can be exercised during development. Once the real
 * endpoints exist, replace the mock bodies with `authAxios.get(...)` calls
 * following the same pattern used in `catalog.svc.ts` / `dropdown.svc.ts` —
 * the function signatures and return shapes should not need to change.
 */

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
  documentProfileValue: string
  updatedAt: string
  isActive: boolean
}

const MOCK_UNITS_SUMMARY: PengurusanUnitSummary[] = [
  { key: 'UNIT_K', value: 'Unit K', count: 5 },
  { key: 'UNIT_M', value: 'Unit M', count: 5 },
  { key: 'UNIT_L', value: 'Unit L', count: 2 },
]

const MOCK_PROFILE_NAME_POOL = [
  'Akta / Ordinan',
  'Carta',
  'Dokumen Tender / Sebut Harga',
  'E-mel',
  'E-mel Muat Naik',
  'Minit Mesyuarat',
  'Surat Rasmi',
]

const buildMockTetapanItems = (unitKey: string, count: number): PengurusanTetapanItem[] => {
  return Array.from({ length: count }, (_, index) => {
    const profileName = MOCK_PROFILE_NAME_POOL[index % MOCK_PROFILE_NAME_POOL.length]
    const profileCode = profileName
      .split(' ')[0]
      .toUpperCase()
      .replace(/[^A-Z]/g, '')

    return {
      documentProfileId: `${unitKey}-${profileCode}-${index + 1}`,
      documentProfileCode: profileCode,
      documentProfileValue: profileName,
      updatedAt: new Date(Date.now() - index * 86_400_000).toISOString(),
      isActive: index % 3 !== 0,
    }
  })
}

const simulateNetworkDelay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Get the list of units with their document settings ("Tetapan") count,
 * used to render the top-level accordion.
 * TODO: replace with `GET /config/profile-document/units-summary` (or the
 * real endpoint) once the backend is available.
 */
export const getPengurusanUnitsSummary = async (): Promise<PengurusanUnitSummary[]> => {
  try {
    await simulateNetworkDelay()
    return MOCK_UNITS_SUMMARY
  } catch (error) {
    console.error('Error fetching pengurusan units summary:', error)
    throw error
  }
}

/**
 * Get the list of document settings ("Tetapan") belonging to a unit,
 * fetched lazily when its accordion item is expanded.
 * TODO: replace with `GET /config/profile-document/{unitKey}` (or the real
 * endpoint) once the backend is available.
 */
export const getPengurusanTetapanByUnit = async (
  unitKey: string
): Promise<PengurusanTetapanItem[]> => {
  try {
    await simulateNetworkDelay()
    const unit = MOCK_UNITS_SUMMARY.find((item) => item.key === unitKey)
    return buildMockTetapanItems(unitKey, unit?.count ?? 0)
  } catch (error) {
    console.error(`Error fetching pengurusan tetapan for unit ${unitKey}:`, error)
    throw error
  }
}
