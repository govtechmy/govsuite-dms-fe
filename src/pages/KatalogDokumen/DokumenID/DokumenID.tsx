import { searchPlugin } from '@react-pdf-viewer/search'
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
    // Mock PDF URL - replace with actual document URL
    pdfUrl: '/MinitMesyuaratSample.pdf',
  }

  // Create search plugin instance
  const searchPluginInstance = searchPlugin()

  return (
    <div className="flex w-full flex-col overflow-auto">
      <HeaderDokumenID
        title={document.title}
        path={document.path}
        date={document.date}
        status={document.status}
        classification={document.classification}
        category={document.category}
        unit={document.unit}
      />
      <SearchBarDokumenID searchPluginInstance={searchPluginInstance} />
      <DokumenContentID pdfUrl={document.pdfUrl} searchPluginInstance={searchPluginInstance} />
    </div>
  )
}
