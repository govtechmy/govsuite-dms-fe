import DokumenContentID from '@/components/page/KatalogDokumen/DokumenID/DokumenContentID'
import { HeaderDokumenID } from '@/components/page/KatalogDokumen/DokumenID/HeaderDokumenID'
import { SearchBarDokumenID } from '@/components/page/KatalogDokumen/DokumenID/SearchBarDokumenID'

export default function DokumenIDPage() {
  // Mock data - replace with actual API data
  const document = {
    title: 'Minit Jemaah Menteri Bil. 12/2026',
    path: 'JKPPN/2020-2024/2024/January/Minit Jemaah Menteri Bil. 12/2026',
    date: '2024-01-10',
    status: 'Diterbitkan',
    classification: 'Terhad',
    category: 'Minit Mesyuarat',
    unit: 'Unit K',
    currentPage: 1,
    totalPages: 34,
  }

  return (
    <div className="flex h-full w-full flex-col">
      <HeaderDokumenID
        title={document.title}
        path={document.path}
        date={document.date}
        status={document.status}
        classification={document.classification}
        category={document.category}
        unit={document.unit}
      />
      <SearchBarDokumenID currentPage={document.currentPage} totalPages={document.totalPages} />
      <DokumenContentID />
    </div>
  )
}
