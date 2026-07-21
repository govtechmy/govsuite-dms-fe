import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import AktivitiTerkini from '@/components/page/Homepage/AktivitiTerkini'
import KategoriMesyuarat from '@/components/page/Homepage/KategoriMesyuarat'
import RingkasanEksekutif from '@/components/page/Homepage/RingkasanEksekutif'
import TrendKekerapanDokumen from '@/components/page/Homepage/TrendKekerapanDokumen'
// import BubbleChart from '@/components/shared/BubbleChart'
// import { dataBubble } from '@/data'
import {
  type ExecutiveSummary,
  type DocumentProfileTrend,
  type LatestActivity,
  type MeetingCategory,
  getLatestActivity,
  getMeetingCategory,
  getProfileTrendInfo,
  getRingkasanEksekutif,
} from '@/services/infoHomepage.svc'
import { buildYearRange } from '@/utils/buildYearRange'
import { useEffect, useMemo, useState } from 'react'

type RingkasanEksekutifCardInfo = {
  jumlahDokumen: number
  perlukanKelulusan: number
  dokumenTidakDiluluskan: number
  dokumenDraf: number
  dokumenDiluluskan: number
}

type RingkasanYearRange = {
  oldest: number
  newest: number
}

const RINGKASAN_ALL_VALUE = 'all'

const INITIAL_RINGKASAN_CARD_INFO: RingkasanEksekutifCardInfo = {
  jumlahDokumen: 0,
  perlukanKelulusan: 0,
  dokumenTidakDiluluskan: 0,
  dokumenDraf: 0,
  dokumenDiluluskan: 0,
}

const INITIAL_RINGKASAN_YEAR_RANGE: RingkasanYearRange = {
  oldest: 2025,
  newest: 2026,
}

const mapSummaryToRingkasanCardInfo = (summary: ExecutiveSummary): RingkasanEksekutifCardInfo => ({
  jumlahDokumen: summary.totalRecords,
  perlukanKelulusan: summary.totalInReview,
  dokumenTidakDiluluskan: summary.totalDisapproved,
  dokumenDraf: summary.totalDrafts,
  dokumenDiluluskan: summary.totalPublished,
})

export default function HomePage() {
  const [unitDropDownTrendRingakasan, setUnitDropDownTrendRingakasan] = useState<string[]>([])
  const [selectedTrendUnitId, setSelectedTrendUnitId] = useState('')
  const [trendKekerapanByUnit, setTrendKekerapanByUnit] = useState<
    Record<string, DocumentProfileTrend[]>
  >({})
  const [meetingCategoriesStore, setMeetingCategoriesStore] = useState<MeetingCategory[]>([])
  const [latestActivitiesStore, setLatestActivitiesStore] = useState<LatestActivity[]>([])
  const [selectedRingkasanYear, setSelectedRingkasanYear] = useState(RINGKASAN_ALL_VALUE)
  const [ringkasanYearRange, setRingkasanYearRange] = useState<RingkasanYearRange>(
    INITIAL_RINGKASAN_YEAR_RANGE
  )
  const [ringkasanCardInfo, setRingkasanCardInfo] = useState<RingkasanEksekutifCardInfo>(
    INITIAL_RINGKASAN_CARD_INFO
  )

  const ringkasanYearOptions = useMemo<Array<string | number>>(() => {
    return [
      RINGKASAN_ALL_VALUE,
      ...buildYearRange(ringkasanYearRange.oldest, ringkasanYearRange.newest),
    ]
  }, [ringkasanYearRange.oldest, ringkasanYearRange.newest])

  const fetchRingkasanByYear = async (year: string) => {
    try {
      const data = await getRingkasanEksekutif(year)
      setRingkasanCardInfo(mapSummaryToRingkasanCardInfo(data.summary))
    } catch (err) {
      console.error('Error fetching ringkasan eksekutif data:', err)
    }
  }

  const handleRingkasanYearChange = (year: string) => {
    const nextYear = year || RINGKASAN_ALL_VALUE
    setSelectedRingkasanYear(nextYear)
    void fetchRingkasanByYear(nextYear)
  }

  useEffect(() => {
    const fetchInitialRingkasanEksekutif = async () => {
      try {
        const data = await getRingkasanEksekutif(RINGKASAN_ALL_VALUE)
        setRingkasanCardInfo(mapSummaryToRingkasanCardInfo(data.summary))
        setRingkasanYearRange({
          oldest: data.oldest ?? 0,
          newest: data.newest ?? 0,
        })
      } catch (err) {
        console.error('Error fetching ringkasan eksekutif data:', err)
        setRingkasanYearRange(INITIAL_RINGKASAN_YEAR_RANGE)
      }
    }

    const fetchGetProfileTrendInfo = async () => {
      try {
        //Remap back to key and value for dropdown fast display, dont want array to keep looping
        const trendItems = await getProfileTrendInfo()
        const trendKekerapanDropdown: string[] = []
        const profileMapByUnit: Record<string, DocumentProfileTrend[]> = {}

        for (const item of trendItems) {
          trendKekerapanDropdown.push(item.unitId)
          profileMapByUnit[item.unitId] = item.documentProfiles
        }

        const defaultUnit = profileMapByUnit.semua ? 'semua' : ''

        setUnitDropDownTrendRingakasan(trendKekerapanDropdown)
        setTrendKekerapanByUnit(profileMapByUnit)
        setSelectedTrendUnitId(defaultUnit)
      } catch (err) {
        console.error('Error fetching dropdown data:', err)
      }
    }

    const fetchGetMeetingCategory = async () => {
      try {
        const meetingCategories = await getMeetingCategory()
        setMeetingCategoriesStore(meetingCategories)
      } catch (err) {
        console.error('Error fetching dropdown data:', err)
      }
    }

    const fetchGetLatestActivity = async () => {
      try {
        const latestActivities = await getLatestActivity()
        setLatestActivitiesStore(latestActivities)
      } catch (err) {
        console.error('Error fetching dropdown data:', err)
      }
    }

    void fetchInitialRingkasanEksekutif()
    fetchGetLatestActivity()
    fetchGetMeetingCategory()
    fetchGetProfileTrendInfo()
  }, [])

  const trendChartData = (trendKekerapanByUnit[selectedTrendUnitId] ?? []).map((item) => ({
    name: item.documentProfileName,
    value: item.count,
  }))
  return (
    <>
      <RightSidePageLayoutWrapper className="border-b border-otl-gray-200">
        <RingkasanEksekutif
          yearOptions={ringkasanYearOptions}
          selectedYear={selectedRingkasanYear}
          onYearChange={handleRingkasanYearChange}
          cardInfo={ringkasanCardInfo}
        />
      </RightSidePageLayoutWrapper>
      <RightSidePageLayoutWrapper className="border-b border-otl-gray-200">
        <TrendKekerapanDokumen
          unit={unitDropDownTrendRingakasan}
          selectedUnit={selectedTrendUnitId}
          onUnitChange={setSelectedTrendUnitId}
          data={trendChartData}
        />
      </RightSidePageLayoutWrapper>
      <div className="grid grid-cols-2 max-[840px]:grid-cols-1 divide-x-[1px] max-[840px]:divide-x-0 max-[840px]:divide-y-[1px] divide-otl-gray-200 border-b border-b-otl-gray-200">
        <KategoriMesyuarat data={meetingCategoriesStore} />
        <AktivitiTerkini data={latestActivitiesStore} />
      </div>
      {/* Next Phase */}
      {/* <RightSidePageLayoutWrapper className="border-b border-otl-gray-200">
        <BubbleChart data={dataBubble} className="h-[700px] w-full" />
      </RightSidePageLayoutWrapper> */}
    </>
  )
}
