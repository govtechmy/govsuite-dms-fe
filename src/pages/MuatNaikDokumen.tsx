import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import type { ProgressState } from '@/components/shared/ProgressResult'
import ProgressResultChecker from '@/components/shared/ProgressResult'
import MuatNaikDokumenForm, { type DocPreviewInfo } from '@/components/MuatNaik/MuatNaikDokumenForm'
import { useState } from 'react'
import PratontonRekod from '@/components/MuatNaik/PratontonRekod'
import { clx } from '@govtechmy/myds-react/utils'

export default function MuatNaikDokumenPage() {
  //  Display Success/Error/Loading State
  const [progress, setProgress] = useState<ProgressState>(null)

  //later post properly
  const handleSubmitDokumen = () => {
    setProgress('loading')

    window.setTimeout(() => {
      setProgress('success')
    }, 2000)
  }

  // Dropdown Profile Document State
  const [selectedProfile, setSelectedProfile] = useState<string>('')
  const [allInfoDocs, setAllInfoDocs] = useState<DocPreviewInfo | null>(null)

  const profilDokumen = [
    'Agenda Mesyuarat',
    'Akta / Ordinan',
    'Audio',
    'Carta',
    'Dokumen Tender / Sebut Harga',
    'E-mel',
    'E-mel Muatnaik',
    'Faks',
    'Foto',
    'Garis Panduan / Panduan',
    'Kertas Kerja / Kertas Konsep',
    'Laporan',
    'Lukisan Teknikal',
    'Maklum Balas Mesyuarat',
    'Memo',
    'Minit Bebas',
    'Minit Ceraian',
    'Minit Mesyuarat',
    'Nota Mesyuarat / Perbincangan',
    'Pekeliling',
    'Perjanjian / Memorandum',
    'Piawaian / Standard',
    'Poster',
    'Prosiding',
    'Siaran Akhbar',
    'Sijil',
    'Slaid Pembentangan',
    'Surat-Menyurat',
    'Teks Ucapan',
    'Terbitan',
    'Video',
    'Borang',
    'Jadual',
  ]
  const peringkatKeselamatan = ['Rahsia Besar', 'Rahsia', 'Sulit', 'Terhad', 'Terbuka']
  const acceptedFileTypes = '.docx,.pdf'

  return (
    <>
      {progress !== null && (
        <div className="flex h-full justify-center items-center">
          {/* 
            template later remove
          <ProgressResultChecker
            progress={progress}
            loadingDescription="Dokumen Sedang Diproses"
            successTitle="Dokumen Berjaya Diluluskan"
            successDescription="Dokumen akan disemak dan diluluskan oleh pegawai bertugas"
            successButtonText="Kembali Ke Laman Utama"
            errorTitle="Gagal Diluluskan!"
            errorDescription="Dokumen gagal diluluskan, sila cuba lagi atau hubungi pentadbir sistem"
            errorButtonText="Kembali Ke Laman Utama"
            errorUploadingTitle={'Dokumen Gagal Diupload'}
            errorUploadingDescription={'Dokumen Gagal Diupload, semak dengan admin anda!'}
            errorUploadingButtonText={'Kembali Ke Laman Utama'}
          /> */}
          <ProgressResultChecker
            progress={progress}
            loadingDescription="Dokumen Sedang Diproses"
            successTitle="Berjaya Disimpan & Dihantar!"
            successDescription="Dokumen akan disemak dan diluluskan oleh pegawai bertugas"
            successButtonText="Kembali Ke Katalog Dokumen"
            successButtonText2="Muat Naik Dokumen Baru"
            errorTitle="Gagal Diluluskan!"
            errorDescription="Dokumen gagal diluluskan, sila cuba lagi atau hubungi pentadbir sistem"
            errorButtonText="Kembali Ke Laman Utama"
            errorUploadingTitle={'Dokumen Gagal Diupload'}
            errorUploadingDescription={'Dokumen Gagal Diupload, semak dengan admin anda!'}
            errorUploadingButtonText={'Kembali Ke Laman Utama'}
            navigateSuccess="/ms/katalog-dokumen"
            navigateSuccess2="/ms/muatnaik-dokumen"
            navigateError="/ms"
            navigateUploadingError="/ms"
          />
        </div>
      )}
      {progress === null && (
        <div className={clx('grid ', selectedProfile && 'grid-cols-2')}>
          <RightSidePageLayoutWrapper
            className={clx('flex flex-col gap-6 w-full ', selectedProfile && 'shadow-card pr-6')}
          >
            <MuatNaikDokumenForm
              profileDokumen={profilDokumen}
              acceptedFileTypes={acceptedFileTypes}
              lokasiFolder={'Lokasi Folder'}
              peringkatKeselamatan={peringkatKeselamatan}
              selectedProfile={selectedProfile}
              setSelectedProfile={setSelectedProfile}
              onPreview={setAllInfoDocs}
              onReset={() => {
                setAllInfoDocs(null)
                setSelectedProfile('')
              }}
            />
          </RightSidePageLayoutWrapper>
          {selectedProfile && (
            <RightSidePageLayoutWrapper className="flex flex-col gap-6 w-full pr-3">
              <PratontonRekod docInfo={allInfoDocs} onSubmit={handleSubmitDokumen} />
            </RightSidePageLayoutWrapper>
          )}
        </div>
      )}
    </>
  )
}
