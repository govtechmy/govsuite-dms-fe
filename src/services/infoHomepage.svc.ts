import { getEnv } from '@/config/runtimeEnv'
import { authAxios } from './http'

export interface DocumentProfileTrend {
  documentProfileName: string
  count: number
}

export interface ProfileTrendByUnit {
  unitId: string
  documentProfiles: DocumentProfileTrend[]
}

export interface MeetingCategory {
  title: string
  description: string
  totalRecords: number
}

export interface LatestActivity {
  title: string
  recordId: string
  recordDate: string
  unitId: string
  accessLevel: string
  workflowState: string
  documentProfileName: string
}

export interface ExecutiveSummary {
  totalRecords: number
  totalInReview: number
  totalDisapproved: number
  totalPublished: number
  totalDrafts: number
}

export interface RingkasanEksekutif {
  year: string
  oldest?: number
  newest?: number
  summary: ExecutiveSummary
}

export const getProfileTrendInfo = async (): Promise<ProfileTrendByUnit[]> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/dashboard/document-profile-trend`
  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data ?? {}
    const rawItems: unknown[] = Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload)
        ? payload
        : []

    return rawItems
      .map((item: unknown): ProfileTrendByUnit => {
        const parsedItem = item as {
          unitId?: unknown
          documentProfiles?: unknown
        }

        const documentProfilesRaw = Array.isArray(parsedItem.documentProfiles)
          ? parsedItem.documentProfiles
          : []

        return {
          unitId: typeof parsedItem.unitId === 'string' ? parsedItem.unitId : '',
          documentProfiles: documentProfilesRaw
            .map((profile: unknown): DocumentProfileTrend => {
              const parsedProfile = profile as {
                documentProfileName?: unknown
                count?: unknown
              }

              return {
                documentProfileName:
                  typeof parsedProfile.documentProfileName === 'string'
                    ? parsedProfile.documentProfileName
                    : '',
                count: typeof parsedProfile.count === 'number' ? parsedProfile.count : 0,
              }
            })
            .filter((profile: DocumentProfileTrend) => profile.documentProfileName !== ''),
        }
      })
      .filter((item: ProfileTrendByUnit) => item.unitId !== '')
  } catch (error) {
    console.error('Error getting record Info:', error)
    throw error
  }
}

export const getMeetingCategory = async (): Promise<MeetingCategory[]> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/dashboard/meeting-category`
  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data ?? {}
    const rawItems: unknown[] = Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload)
        ? payload
        : []

    return rawItems.map((item: unknown): MeetingCategory => {
      const parsedItem = item as {
        title?: unknown
        description?: unknown
        totalRecords?: unknown
      }

      return {
        title: typeof parsedItem.title === 'string' ? parsedItem.title : '',
        description: typeof parsedItem.description === 'string' ? parsedItem.description : '',
        totalRecords: typeof parsedItem.totalRecords === 'number' ? parsedItem.totalRecords : 0,
      }
    })
  } catch (error) {
    console.error('Error getting record Info:', error)
    throw error
  }
}

export const getLatestActivity = async (): Promise<LatestActivity[]> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/dashboard/latest-activities`
  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data ?? {}
    const rawItems: unknown[] = Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload)
        ? payload
        : []

    return rawItems.map((item: unknown): LatestActivity => {
      const parsedItem = item as {
        title?: unknown
        recordId?: unknown
        recordDate?: unknown
        unitId?: unknown
        accessLevel?: unknown
        workflowState?: unknown
        documentProfileName?: unknown
      }

      return {
        title: typeof parsedItem.title === 'string' ? parsedItem.title : '',
        recordId: typeof parsedItem.recordId === 'string' ? parsedItem.recordId : '',
        recordDate: typeof parsedItem.recordDate === 'string' ? parsedItem.recordDate : '',
        unitId: typeof parsedItem.unitId === 'string' ? parsedItem.unitId : '',
        accessLevel: typeof parsedItem.accessLevel === 'string' ? parsedItem.accessLevel : '',
        workflowState: typeof parsedItem.workflowState === 'string' ? parsedItem.workflowState : '',
        documentProfileName:
          typeof parsedItem.documentProfileName === 'string' ? parsedItem.documentProfileName : '',
      }
    })
  } catch (error) {
    console.error('Error getting record Info:', error)
    throw error
  }
}

export const getRingkasanEksekutif = async (year: string): Promise<RingkasanEksekutif> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/dashboard/executive-summary/${year}`
  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data ?? {}
    const parsedPayload = payload as {
      year?: unknown
      oldest?: unknown
      newest?: unknown
      summary?: unknown
    }

    const summaryRaw = parsedPayload.summary as {
      totalRecords?: unknown
      totalInReview?: unknown
      totalDisapproved?: unknown
      totalPublished?: unknown
      totalDrafts?: unknown
    }

    return {
      year: typeof parsedPayload.year === 'string' ? parsedPayload.year : '',
      oldest: typeof parsedPayload.oldest === 'number' ? parsedPayload.oldest : 0,
      newest: typeof parsedPayload.newest === 'number' ? parsedPayload.newest : 0,
      summary: {
        totalRecords: typeof summaryRaw?.totalRecords === 'number' ? summaryRaw.totalRecords : 0,
        totalInReview: typeof summaryRaw?.totalInReview === 'number' ? summaryRaw.totalInReview : 0,
        totalDisapproved:
          typeof summaryRaw?.totalDisapproved === 'number' ? summaryRaw.totalDisapproved : 0,
        totalPublished:
          typeof summaryRaw?.totalPublished === 'number' ? summaryRaw.totalPublished : 0,
        totalDrafts: typeof summaryRaw?.totalDrafts === 'number' ? summaryRaw.totalDrafts : 0,
      },
    }
  } catch (error) {
    console.error('Error getting record Info:', error)
    throw error
  }
}
