import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import AktivitiTerkini from '@/components/Homepage/AktivitiTerkini'
import BubbleChart from '@/components/shared/BubbleChart'
import KategoriMesyuarat from '@/components/Homepage/KategoriMesyuarat'
import TrendKekerapanDokumen from '@/components/Homepage/TrendKekerapanDokumen'

export default function HomePage() {
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
        <div>Ringkasan Eksekutif</div>
      </RightSidePageLayoutWrapper>
      <RightSidePageLayoutWrapper className="border-b border-otl-gray-200">
        <TrendKekerapanDokumen unit={unit} data={data} />
      </RightSidePageLayoutWrapper>

      <div className="grid grid-cols-2 divide-x-[1px] divide-otl-gray-200 border-b border-b-otl-gray-200">
        <KategoriMesyuarat />
        <AktivitiTerkini />
      </div>

      <RightSidePageLayoutWrapper className="border-b border-otl-gray-200">
        <BubbleChart />
      </RightSidePageLayoutWrapper>
    </>
  )
}
