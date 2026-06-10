import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import AktivitiTerkini from '@/components/page/Homepage/AktivitiTerkini';
import KategoriMesyuarat from '@/components/page/Homepage/KategoriMesyuarat';
import RingkasanEksekutif from '@/components/page/Homepage/RingkasanEksekutif';
import TrendKekerapanDokumen from '@/components/page/Homepage/TrendKekerapanDokumen';
import BubbleChart from '@/components/shared/BubbleChart';


export default function HomePage() {

  const Tahun= [ '2025', '2024']
  const cardInfo = {
    jumlahDokumen: 821,
    perlukanKelulusan: 42,
    dokumenTidakDiluluskan: 10,
  };

  const unit = ['unit k ', 'unit l']
  const data = [
    { name: 'Agenda Mesyuarat', value: 500 },
    { name: 'Minit Mesyuarat', value: 380 },
    { name: 'Nota Mesyuarat', value: 300 },
    { name: 'Laporan', value: 200 },
    { name: 'Slide Pembentangan', value: 180 },
  ]

  const dataBubble = [
    { id: 'pembangunan', value: 842 },
    { id: 'laksana', value: 490 },
    { id: 'bantuan', value: 490 },
    { id: 'ekonomi', value: 490 },
    { id: 'sasar', value: 490 },
    { id: 'cukai', value: 490 },
    { id: 'harga', value: 490 },
    { id: 'rakyat', value: 490 },
    { id: 'usaha', value: 490 },
    { id: 'kos', value: 345 },
    { id: 'hak', value: 345 },
    { id: 'air', value: 345 },
    { id: 'api', value: 345 },
    { id: 'minyak', value: 345 },
    { id: 'diesel', value: 345 },
    { id: 'petrol', value: 345 },
    { id: 'nilai', value: 345 },
    { id: 'hasil', value: 345 },
    { id: 'kadar', value: 248 },
    { id: 'zakat', value: 247 },
    { id: 'polis', value: 247 },
    { id: 'firma', value: 247 },
    { id: 'modal', value: 132 },
    { id: 'pakej', value: 132 },
    { id: 'bayar', value: 132 },
    { id: 'niaga', value: 289 },
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
