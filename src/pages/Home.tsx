import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import AktivitiTerkini from '@/components/page/Homepage/AktivitiTerkini'
import KategoriMesyuarat from '@/components/page/Homepage/KategoriMesyuarat'
import RingkasanEksekutif from '@/components/page/Homepage/RingkasanEksekutif'
import TrendKekerapanDokumen from '@/components/page/Homepage/TrendKekerapanDokumen'
import BubbleChart from '@/components/shared/BubbleChart'
import { dataBubble } from '@/data'

export default function HomePage() {
  const Tahun = ['2025', '2024']
  const cardInfo = {
    jumlahDokumen: 821,
    perlukanKelulusan: 42,
    dokumenTidakDiluluskan: 10,
  }

  const unit = ['unit k ', 'unit l']
  const data = [
    { name: 'Agenda Mesyuarat', value: 500 },
    { name: 'Minit Mesyuarat', value: 380 },
    { name: 'Nota Mesyuarat', value: 300 },
    { name: 'Laporan', value: 200 },
    { name: 'Slide Pembentangan', value: 180 },
  ]

  return (
    <>
      <RightSidePageLayoutWrapper className="border-b border-otl-gray-200">
        <RingkasanEksekutif Tahun={Tahun} cardInfo={cardInfo} />
      </RightSidePageLayoutWrapper>
      <RightSidePageLayoutWrapper className="border-b border-otl-gray-200">
        <TrendKekerapanDokumen unit={unit} data={data} />
      </RightSidePageLayoutWrapper>

      <div className="grid grid-cols-2 max-[840px]:grid-cols-1 divide-x-[1px] max-[840px]:divide-x-0 max-[840px]:divide-y-[1px] divide-otl-gray-200 border-b border-b-otl-gray-200">
        <KategoriMesyuarat />
        <AktivitiTerkini />
      </div>

      <RightSidePageLayoutWrapper className="border-b border-otl-gray-200">
        <BubbleChart data={dataBubble} className="h-[700px] w-full" />
      </RightSidePageLayoutWrapper>
    </>
  )
}
