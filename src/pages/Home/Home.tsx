import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import AktivitiTerkini from '@/components/page/Homepage/AktivitiTerkini'
import KategoriMesyuarat from '@/components/page/Homepage/KategoriMesyuarat'
import RingkasanEksekutif from '@/components/page/Homepage/RingkasanEksekutif'
import TrendKekerapanDokumen from '@/components/page/Homepage/TrendKekerapanDokumen'
// import BubbleChart from '@/components/shared/BubbleChart'
// import { dataBubble } from '@/data'
import {
  type DocumentProfileTrend,
  type LatestActivity,
  type MeetingCategory,
  getLatestActivity,
  getMeetingCategory,
  getProfileTrendInfo,
  getRingkasanEksekutif,
} from '@/services/infoHomepage.svc'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [unitDropDownTrendRingakasan, setUnitDropDownTrendRingakasan] = useState<string[]>([])
  const [selectedTrendUnitId, setSelectedTrendUnitId] = useState('')
  const [trendKekerapanByUnit, setTrendKekerapanByUnit] = useState<
    Record<string, DocumentProfileTrend[]>
  >({})
  const [meetingCategoriesStore, setMeetingCategoriesStore] = useState<MeetingCategory[]>([])
  const [latestActivitiesStore, setLatestActivitiesStore] = useState<LatestActivity[]>([])

  useEffect(() => {
    //ENDPOINT NOT READY
    const fetchGetRingkasanEksekutif = async () => {
      try {
        await getRingkasanEksekutif()
        // console.log('THIS IS RINGKASAN EKSEKUTIF', data)
      } catch (err) {
        console.error('Error fetching dropdown data:', err)
      }
    }

    //DONE
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

    //DONE
    const fetchGetMeetingCategory = async () => {
      try {
        const meetingCategories = await getMeetingCategory()
        setMeetingCategoriesStore(meetingCategories)
      } catch (err) {
        console.error('Error fetching dropdown data:', err)
      }
    }

    //DONE
    const fetchGetLatestActivity = async () => {
      try {
        const latestActivities = await getLatestActivity()
        setLatestActivitiesStore(latestActivities)
      } catch (err) {
        console.error('Error fetching dropdown data:', err)
      }
    }

    fetchGetRingkasanEksekutif()
    fetchGetLatestActivity()
    fetchGetMeetingCategory()
    fetchGetProfileTrendInfo()
  }, [])

  const Tahun = ['2025', '2024']
  const cardInfo = {
    jumlahDokumen: 821,
    perlukanKelulusan: 42,
    dokumenTidakDiluluskan: 10,
    dokumenDraf: 15,
  }

  const trendChartData = (trendKekerapanByUnit[selectedTrendUnitId] ?? []).map((item) => ({
    name: item.documentProfileName,
    value: item.count,
  }))
  return (
    <>
      <RightSidePageLayoutWrapper className="border-b border-otl-gray-200">
        <RingkasanEksekutif Tahun={Tahun} cardInfo={cardInfo} />
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
