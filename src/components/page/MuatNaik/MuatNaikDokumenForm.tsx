import { Button } from '@govtechmy/myds-react/button'
import { ReloadIcon } from '@govtechmy/myds-react/icon'
import { useEffect, useState } from 'react'
import { useUploadStore, type UploadState } from '@/store/UploadStore'
import { useFolderLocationStore } from '@/store/FolderLocationStore'
import { Input } from '@govtechmy/myds-react/input'
import { DatePicker } from '@govtechmy/myds-react/date-picker'
import ModalLokasiFolder from './ModalLokasiFolder'
import MainHeading from '@/components/layout/MainHeading'
import DropdownWithSearch from '@/components/shared/DropdownWithSearch'
import SelectDropdownMyds from '@/components/shared/SelectDropdownMyds'
import UploadDocument from '@/components/shared/UploadDocument'
import { TextArea } from '@govtechmy/myds-react/textarea'
import type { AccessLevel, DropdownUnit, DropdownJenisDokumen } from '@/services/dropdown.svc'
import SelectDropdownUnit from './SelectDropdownUnit'
import type { MetadataField } from '@/services/upload.svc'
import extractBackendError from '@/utils/extractBackendError'

const parseDateValue = (value: string): Date | undefined => {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined
  const parsed = new Date(year, month - 1, day)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

const formatDateValue = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export interface DocPreviewInfo {
  lokasiFolder: string
  profilDokumen: string
  tahapKeselamatan: string
  ringkasan: string
  metadataValues: Record<string, string>
  metadataFields: MetadataField[]
  tempatMesyuarat: string
  bilanganHelaian: string
  jenisKemasukan: string
}

interface MuatNaikDokumenFormProps {
  dropdownJenisDokumen: DropdownJenisDokumen[]
  peringkatKeselamatan: AccessLevel[]
  acceptedFileTypes: string
  selectedProfile: string
  setSelectedProfile: (value: string) => void
  onPreview: (info: DocPreviewInfo) => void
  onReset?: () => void
  dropdownUnits: DropdownUnit[]
  selectedUnit: string | undefined
  onUnitChange: (unitCode: string) => void
  metadataFields: MetadataField[]
  onUploadToS3: (file: File) => Promise<void>
  uploadPercentage: number
}

interface PreviewDocumentInfo {
  fileName: string
}

export default function MuatNaikDokumenForm({
  dropdownJenisDokumen,
  peringkatKeselamatan,
  acceptedFileTypes,
  selectedProfile,
  setSelectedProfile,
  onPreview,
  onReset,
  dropdownUnits,
  selectedUnit,
  onUnitChange,
  metadataFields,
  onUploadToS3,
  uploadPercentage,
}: MuatNaikDokumenFormProps) {
  const { folderSelection, resetFolderSelection } = useFolderLocationStore()
  const [selectedPeringkatKeselamatan, setSelectedPeringkatKeselamatan] = useState('')
  const [ringkasan, setRingkasan] = useState('')
  const [metadataValues, setMetadataValues] = useState<Record<string, string>>({})
  const [tempatMesyuarat, setTempatMesyuarat] = useState('')
  const [bilanganHelaian, setBilanganHelaian] = useState('')
  const [jenisKemasukan, setJenisKemasukan] = useState('')
  const [uploadState, setUploadState] = useState<UploadState>(1)
  const [uploadErrorMessage, setUploadErrorMessage] = useState('')
  const [previewDocumentInfoData, setPreviewDocumentInfoData] =
    useState<PreviewDocumentInfo | null>(null)
  const { setSelectedFile } = useUploadStore()

  const profileDokumenOptions = dropdownJenisDokumen.map((item) => item.codeName)

  const isRequiredMetadataComplete = metadataFields
    .filter((field) => field.required)
    .every((field) => metadataValues[field.key]?.trim() !== '')

  useEffect(() => {
    if (!selectedProfile) {
      setSelectedPeringkatKeselamatan('')
    }
  }, [selectedProfile])

  useEffect(() => {
    setMetadataValues({})
  }, [metadataFields])

  const handleFileUploadChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setPreviewDocumentInfoData({
        fileName: file.name.split('.')[0],
      })
      setSelectedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        rawFile: file, // Preserve raw File object for S3 upload
        body: {
          fileName: file.name.split('.')[0],
          originalFileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileExtension: file.name.split('.').pop() || '',
        },
      })

      try {
        // Trigger S3 upload immediately after file selection
        await onUploadToS3(file)
        setUploadState(3) // uploaded state - only after successful upload
      } catch (error) {
        console.error('Error uploading to S3:', error)
        const backendError = extractBackendError(error)
        setUploadState(4)
        setUploadErrorMessage(backendError?.message || 'Upload gagal. Cuba lagi.')
        setPreviewDocumentInfoData(null)
        setSelectedFile(null)
        event.target.value = ''
      }
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
      lokasiFolder: folderSelection.path,
      profilDokumen: selectedProfile,
      tahapKeselamatan: selectedPeringkatKeselamatan,
      ringkasan,
      metadataValues,
      metadataFields,
      tempatMesyuarat,
      bilanganHelaian,
      jenisKemasukan,
    })
  }

  const handleResetForm = () => {
    setSelectedProfile('')
    setSelectedPeringkatKeselamatan('')
    setRingkasan('')
    setMetadataValues({})
    setTempatMesyuarat('')
    setBilanganHelaian('')
    setJenisKemasukan('')
    resetFolderSelection()
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
          <ModalLokasiFolder selectedPath={folderSelection.path} />
        </div>
        <div className="flex flex-col gap-1.5">
          <div>Muat Naik ke Folder Unit</div>
          <SelectDropdownUnit
            dropdownUnits={dropdownUnits}
            selectedUnit={selectedUnit}
            onUnitChange={onUnitChange}
          />
        </div>

        {selectedUnit && (
          <div className="flex flex-col gap-1.5">
            <div>Profil Dokumen</div>
            <DropdownWithSearch
              options={profileDokumenOptions}
              value={selectedProfile}
              onValueChange={setSelectedProfile}
              className="w-full font-normal"
            />
          </div>
        )}
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
            uploadPercentage={uploadPercentage}
          />
          <div className="flex flex-col gap-3 text-body-md font-medium text-txt-black-700">
            <div className="text-body-md font-semibold font-body text-txt-black-900">
              Dublin Core (Metadata)
            </div>
            {metadataFields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <div className="flex">
                  {field.title}
                  {field.required && <div className="text-txt-danger">*</div>}
                </div>
                {field.type === 'date' ? (
                  <DatePicker
                    locale="ms"
                    placeholder="Pilih Tarikh"
                    value={parseDateValue(metadataValues[field.key] || '')}
                    onValueChange={(date) =>
                      setMetadataValues((prev) => ({
                        ...prev,
                        [field.key]: formatDateValue(date),
                      }))
                    }
                  />
                ) : (
                  <Input
                    type="text"
                    value={metadataValues[field.key] || ''}
                    onChange={(e) =>
                      setMetadataValues((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                  />
                )}
              </div>
            ))}
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
