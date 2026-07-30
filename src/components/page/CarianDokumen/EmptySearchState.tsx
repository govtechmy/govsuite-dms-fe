import MainHeading from '@/components/layout/MainHeading'
import SearchBarCarianDokumen from '@/components/page/CarianDokumen/SearchBarCarianDokumen'
import CarianDokumen from '@/assets/png/CarianDokumen.png'

export default function EmptySearchState() {
  return (
    <div className="flex flex-col gap-12 items-center justify-center w-full">
      <MainHeading>Carian Dokumen</MainHeading>
      <SearchBarCarianDokumen className="max-w-[560px]" />
      <img src={CarianDokumen} alt="" className="max-w-full shrink-0 object-contain" />
    </div>
  )
}
