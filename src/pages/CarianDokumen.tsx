import MainHeading from '@/components/layout/MainHeading'
import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import SearchBarCarianDokumen from '@/components/page/CarianDokumen/SearchBarCarianDokumen'
import CarianDokumen from '@/assets/png/CarianDokumen.png'

export default function CarianDokumenPage() {
  return (
    <RightSidePageLayoutWrapper className="flex flex-col items-center justify-center h-full">
      <div className="flex flex-col gap-12 items-center justify-center w-full">
        <MainHeading>Carian Dokumen</MainHeading>
        <SearchBarCarianDokumen />
        <img src={CarianDokumen} alt={CarianDokumen} className="shrink-0 object-contain" />
      </div>
    </RightSidePageLayoutWrapper>
  )
}
