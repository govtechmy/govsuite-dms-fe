import { Button } from '@govtechmy/myds-react/button'
import { ReloadIcon } from '@govtechmy/myds-react/icon'
import { useEffect, useState } from 'react'
import { useUploadStore, type UploadState } from '@/store/UploadStore'
import { Input } from '@govtechmy/myds-react/input'
import ModalLokasiFolder from './ModalLokasiFolder'
import MainHeading from '@/components/layout/MainHeading'
import DropdownWithSearch from '@/components/shared/DropdownWithSearch'
import SelectDropdownMyds from '@/components/shared/SelectDropdownMyds'
import UploadDocument from '@/components/shared/UploadDocument'
import { TextArea } from '@govtechmy/myds-react/textarea'

export interface DocPreviewInfo {
  lokasiFolder: string
  profilDokumen: string
  tahapKeselamatan: string
  ringkasan: string
  tajuk: string
  tarikhMesyuarat: string
  klasifikasiFail: string
  namaPewujud: string
  tempatMesyuarat: string
  bilanganHelaian: string
  jenisKemasukan: string
}

interface MuatNaikDokumenFormProps {
  profileDokumen: string[]
  peringkatKeselamatan: string[]
  acceptedFileTypes: string
  lokasiFolder?: string
  selectedProfile: string
  setSelectedProfile: (value: string) => void
  onPreview: (info: DocPreviewInfo) => void
  onReset?: () => void
}

interface PreviewDocumentInfo {
  fileName: string
}

export default function MuatNaikDokumenForm({
  profileDokumen,
  peringkatKeselamatan,
  acceptedFileTypes,
  lokasiFolder,
  selectedProfile,
  setSelectedProfile,
  onPreview,
  onReset,
}: MuatNaikDokumenFormProps) {
  const [selectedPeringkatKeselamatan, setSelectedPeringkatKeselamatan] = useState('')
  const [ringkasan, setRingkasan] = useState('')
  const [tajuk, setTajuk] = useState('')
  const [tarikhMesyuarat, setTarikhMesyuarat] = useState('')
  const [klasifikasiFail, setKlasifikasiFail] = useState('')
  const [namaPewujud, setNamaPewujud] = useState('')
  const [tempatMesyuarat, setTempatMesyuarat] = useState('')
  const [bilanganHelaian, setBilanganHelaian] = useState('')
  const [jenisKemasukan, setJenisKemasukan] = useState('')
  const [uploadState, setUploadState] = useState<UploadState>(1)
  const [uploadErrorMessage, setUploadErrorMessage] = useState('')
  const [previewDocumentInfoData, setPreviewDocumentInfoData] =
    useState<PreviewDocumentInfo | null>(null)
  const { setSelectedFile } = useUploadStore()

  const isRequiredMetadataComplete =
    tajuk.trim() !== '' &&
    tarikhMesyuarat.trim() !== '' &&
    klasifikasiFail.trim() !== '' &&
    namaPewujud.trim() !== ''

  useEffect(() => {
    if (!selectedProfile) {
      setSelectedPeringkatKeselamatan('')
    }
  }, [selectedProfile])

  const handleFileUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    const allowedExtensions = acceptedFileTypes
      .split(',')
      .map((value) => value.trim().toLowerCase().replace(/^\./, ''))
    const fileExtension = file?.name?.split('.').pop()?.toLowerCase() ?? ''
    const allowedMimeTypes = new Set([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ])

    if (file) {
      const hasAllowedExtension = allowedExtensions.includes(fileExtension)
      const hasAllowedMimeType = allowedMimeTypes.has(file.type)

      if (!hasAllowedExtension && !hasAllowedMimeType) {
        setUploadState(4)
        setUploadErrorMessage('Format fail tidak disokong. Sila muat naik fail DOCX atau PDF.')
        setPreviewDocumentInfoData(null)
        setSelectedFile(null)
        event.target.value = ''
        return
      }

      setUploadErrorMessage('')
      setUploadState(2) // uploading state
      // Simulate file processing
      setTimeout(() => {
        setUploadState(3) // uploaded state
        setPreviewDocumentInfoData({
          fileName: file.name.split('.')[0],
        })
        setSelectedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          body: {
            fileName: file.name.split('.')[0],
            originalFileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileExtension: file.name.split('.').pop() || '',
          },
        })
      }, 1000)
    }
  }

  const handleResetClick = () => {
    setUploadState(1)
    setUploadErrorMessage('')
    setPreviewDocumentInfoData(null)
    setSelectedFile(null)
  }

  const handleDisabledButton = () => {
    return uploadState === 2 || !selectedProfile
  }

  const handlePreviewClick = () => {
    onPreview({
      lokasiFolder: lokasiFolder ?? '',
      profilDokumen: selectedProfile,
      tahapKeselamatan: selectedPeringkatKeselamatan,
      ringkasan,
      tajuk,
      tarikhMesyuarat,
      klasifikasiFail,
      namaPewujud,
      tempatMesyuarat,
      bilanganHelaian,
      jenisKemasukan,
    })
  }

  const handleResetForm = () => {
    setSelectedProfile('')
    setSelectedPeringkatKeselamatan('')
    setRingkasan('')
    setTajuk('')
    setTarikhMesyuarat('')
    setKlasifikasiFail('')
    setNamaPewujud('')
    setTempatMesyuarat('')
    setBilanganHelaian('')
    setJenisKemasukan('')
    handleResetClick()
    onReset?.()
  }

  return (
    <>
      <div className="flex justify-between">
        <MainHeading>Muat Naik Dokumen</MainHeading>
        <Button variant="default-outline" className="gap-2" onClick={handleResetForm}>
          <ReloadIcon />
          <div>Set Semula</div>
        </Button>
      </div>
      <div className="flex flex-col gap-3 text-body-md font-medium font-body text-txt-black-700 max-w-[460px]">
        <div className="flex flex-col gap-1.5">
          <div>Lokasi Folder</div>
          <ModalLokasiFolder lokasiFolder={lokasiFolder} />
        </div>
        <div className="flex flex-col gap-1.5">
          <div>Profil Dokumen</div>
          <DropdownWithSearch
            options={profileDokumen}
            value={selectedProfile}
            onValueChange={setSelectedProfile}
            className="w-full font-normal"
          />
        </div>
        {selectedProfile && (
          <>
            <div className="flex flex-col gap-1.5">
              <div>Tahap Keselamatan</div>
              <SelectDropdownMyds
                peringkatKeselamatan={peringkatKeselamatan}
                selectedPeringkatKeselamatan={selectedPeringkatKeselamatan}
                setSelectedPeringkatKeselamatan={setSelectedPeringkatKeselamatan}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div>Ringkasan (Pilihan)</div>
              <TextArea value={ringkasan} onChange={(e) => setRingkasan(e.target.value)} />
            </div>
          </>
        )}
      </div>
      {selectedProfile && (
        <>
          <UploadDocument
            handleFileUploadChange={handleFileUploadChange}
            handleResetClick={handleResetClick}
            handleDisabledButton={handleDisabledButton}
            uploadState={uploadState}
            fileType={acceptedFileTypes}
            displayFileName={previewDocumentInfoData?.fileName}
            uploadErrorMessage={uploadErrorMessage}
          />
          <div className="flex flex-col gap-3 text-body-md font-medium text-txt-black-700">
            <div className="text-body-md font-semibold font-body text-txt-black-900">
              Dublin Core (Metadata)
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex">
                Tajuk <div className="text-txt-danger">*</div>
              </div>
              <Input value={tajuk} onChange={(e) => setTajuk(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex">
                Tarikh Mesyuarat <div className="text-txt-danger">*</div>
              </div>
              <Input value={tarikhMesyuarat} onChange={(e) => setTarikhMesyuarat(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex">
                Klasifikasi Fail<div className="text-txt-danger">*</div>
              </div>
              <SelectDropdownMyds
                peringkatKeselamatan={peringkatKeselamatan}
                selectedPeringkatKeselamatan={klasifikasiFail}
                setSelectedPeringkatKeselamatan={setKlasifikasiFail}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex">
                Nama Pewujud <div className="text-txt-danger">*</div>
              </div>
              <Input value={namaPewujud} onChange={(e) => setNamaPewujud(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-3 text-body-md font-medium text-txt-black-700">
            <div className="text-body-md font-semibold font-body text-txt-black-900">
              Metadata Tambahan (Repositori)
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex">Tempat Mesyuarat</div>
              <Input value={tempatMesyuarat} onChange={(e) => setTempatMesyuarat(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex">Bilangan Helaian</div>
              <Input value={bilanganHelaian} onChange={(e) => setBilanganHelaian(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex">Jenis Kemasukan Rekod</div>
              <Input value={jenisKemasukan} onChange={(e) => setJenisKemasukan(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="default-outline">Simpan Draf</Button>
            <Button
              variant="primary-outline"
              disabled={uploadState !== 3 || !isRequiredMetadataComplete}
              onClick={handlePreviewClick}
            >
              Muat Naik Pratonton
            </Button>
          </div>
        </>
      )}
    </>
  )
}
