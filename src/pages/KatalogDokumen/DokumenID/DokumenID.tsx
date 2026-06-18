import { searchPlugin } from '@react-pdf-viewer/search'
import DokumenContentID from '@/components/page/KatalogDokumen/DokumenID/DokumenContentID'
import { HeaderDokumenID } from '@/components/page/KatalogDokumen/DokumenID/HeaderDokumenID'
import { SearchBarDokumenID } from '@/components/page/KatalogDokumen/DokumenID/SearchBarDokumenID'
import ProgressResultChecker, { type ProgressState } from '@/components/shared/ProgressResult'
import { useState } from 'react'

export default function DokumenIDPage() {
  const [progressApprove, setProgressApprove] = useState<ProgressState>(null)
  const [progressDisapprove, setProgressDisapprove] = useState<ProgressState>(null)
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

  const handleApproveDokumen = () => {
    setProgressApprove('loading')

    window.setTimeout(() => {
      setProgressApprove('success')
    }, 2000)
  }

  const handleNotApproveDokumen = () => {
    setProgressDisapprove('loading')

    window.setTimeout(() => {
      setProgressDisapprove('success')
    }, 2000)
  }

  return (
    <>
      {progressApprove === null && progressDisapprove === null && (
        <div className="flex w-full flex-col overflow-auto">
          <HeaderDokumenID
            title={document.title}
            path={document.path}
            date={document.date}
            status={document.status}
            classification={document.classification}
            category={document.category}
            unit={document.unit}
            onApproveDokumen={handleApproveDokumen}
            onNotApproveDokumen={handleNotApproveDokumen}
          />
          <SearchBarDokumenID searchPluginInstance={searchPluginInstance} />
          <DokumenContentID pdfUrl={document.pdfUrl} searchPluginInstance={searchPluginInstance} />
        </div>
      )}
      {progressApprove && (
        <div className="flex w-full h-full">
          <ProgressResultChecker
            progress={progressApprove}
            loadingDescription="Kelulusan Sedang Diproses"
            successTitle="Dokumen Berjaya Diluluskan"
            successDescription="Dokumen telah berjaya diluluskan dan diterbitkan."
            successButtonText="Kembali Ke Senarai Dokumen"
            errorTitle="Dokumen Gagal Diluluskan!"
            errorDescription="Dokumen gagal diluluskan, sila cuba lagi atau hubungi pentadbir sistem"
            errorButtonText="Kembali Ke Senarai Dokumen"
            navigateSuccess="/ms/perlu-kelulusan"
            navigateError="/ms/perlu-kelulusan"
          />
        </div>
      )}

      {progressDisapprove && (
        <div className="flex w-full h-full">
          <ProgressResultChecker
            progress={progressDisapprove}
            loadingDescription="Kelulusan Sedang Diproses"
            successTitle="Dokumen Tidak Diluluskan"
            successDescription="Dokumen telah dihantar semula kepada pewujud untuk tindakan seterusnya."
            successButtonText="Kembali Ke Senarai Dokumen"
            errorTitle="Dokumen Gagal Diproses!"
            errorDescription="Sila cuba lagi atau hubungi pentadbir sistem."
            errorButtonText="Kembali Ke Senarai Dokumen"
            navigateSuccess="/ms/perlu-kelulusan"
            navigateError="/ms/perlu-kelulusan"
          />
        </div>
      )}
    </>
  )
}
