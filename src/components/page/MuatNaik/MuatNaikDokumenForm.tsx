import { Button } from '@govtechmy/myds-react/button'
import { ReloadIcon } from '@govtechmy/myds-react/icon'
import { useEffect } from 'react'
import { useUploadStore } from '@/store/UploadStore'
import { useUploadDraftStore } from '@/store/UploadDraftStore'
import { useFolderLocationStore } from '@/store/FolderLocationStore'
import { Input } from '@govtechmy/myds-react/input'
import { DatePicker } from '@govtechmy/myds-react/date-picker'
import ModalLokasiFolder from './ModalLokasiFolder'
import MainHeading from '@/components/layout/MainHeading'
import DropdownWithSearch from '@/components/shared/DropdownWithSearch'
import SelectDropdownMyds from '@/components/shared/SelectDropdownMyds'
import UploadDocument from '@/components/shared/UploadDocument'
import { TextArea } from '@govtechmy/myds-react/textarea'
import type { AccessLevel, DropdownUnit, ProfileDocument } from '@/services/dropdown.svc'
import SelectDropdownUnit from './SelectDropdownUnit'
import type { MetadataField } from '@/services/upload.svc'
import type { FileInfo } from '@/components/shared/UploadDocument'
import extractBackendError from '@/utils/extractBackendError'
import { Callout, CalloutContent, CalloutTitle } from '@govtechmy/myds-react/callout'
import {
  parseDateValue,
  formatDateValue,
  parseDocumentDateValue,
  formatDocumentDateValue,
} from '@/utils/formatDate'

export interface DocPreviewInfo {
  lokasiFolder: string
  profilDokumen: string
  tahapKeselamatan: string
  ringkasan: string
  requiredMetadataValues: Record<string, string>
  additionalMetadataValues: Record<string, string>
  requiredMetadataFields: MetadataField[]
  additionalMetadataFields: MetadataField[]
  newUploadedRecordId?: string
}

type DraftFeedback = {
  status: 'success' | 'error'
  message: string
  errorDetail?: string
} | null

interface MuatNaikDokumenFormProps {
  dropdownJenisDokumen: ProfileDocument[]
  accessLevelArray: AccessLevel[]
  acceptedFileTypes: string
  selectedProfile: string
  setSelectedProfile: (value: string) => void
  onPreview: (info: DocPreviewInfo) => void
  onSaveDraft: (info: DocPreviewInfo) => Promise<void>
  onReset?: () => void
  dropdownUnits: DropdownUnit[]
  selectedUnit: string | undefined
  onUnitChange: (unitCode: string) => void
  metadataRequired: MetadataField[]
  metadataAdditional: MetadataField[]
  onUploadToS3: (file: File) => Promise<void>
  uploadPercentage: number
  isSaving: boolean
  draftFeedback: DraftFeedback
  onDraftFeedbackDismiss: () => void
  titleFallbackNotice: string | null
  retentionPeriod: string
  savedRecordDate: string
  setSavedRecordDate: (value: string) => void
  version: string
  lastUploadedFile?: FileInfo | null
  draftStatus?: Boolean
  newRecordId?: string
}

export default function MuatNaikDokumenForm({
  dropdownJenisDokumen,
  accessLevelArray,
  acceptedFileTypes,
  selectedProfile,
  setSelectedProfile,
  onPreview,
  onSaveDraft,
  onReset,
  dropdownUnits,
  selectedUnit,
  onUnitChange,
  metadataRequired,
  metadataAdditional,
  retentionPeriod,
  onUploadToS3,
  uploadPercentage,
  isSaving,
  draftFeedback,
  onDraftFeedbackDismiss,
  titleFallbackNotice,
  savedRecordDate,
  setSavedRecordDate,
  version,
  lastUploadedFile,
  draftStatus,
  newRecordId,
}: MuatNaikDokumenFormProps) {
  const { folderSelection, resetFolderSelection } = useFolderLocationStore()
  const {
    selectedAccessLevel,
    setSelectedAccessLevel,
    ringkasan,
    setRingkasan,
    requiredMetadataValues,
    setRequiredMetadataField,
    additionalMetadataValues,
    setAdditionalMetadataField,
    uploadState,
    setUploadState,
    uploadErrorMessage,
    setUploadErrorMessage,
    previewDocumentInfoData,
    setPreviewDocumentInfoData,
  } = useUploadDraftStore()
  const { setSelectedFile } = useUploadStore()

  const profileDokumenOptions = dropdownJenisDokumen.map((item) => item.documentProfile)

  const isRequiredMetadataComplete = metadataRequired
    .filter((field) => field.required)
    .every((field) => requiredMetadataValues[field.key]?.trim() !== '')

  const isAdditionalMetadataComplete = metadataAdditional
    .filter((field) => field.required)
    .every((field) => additionalMetadataValues[field.key]?.trim() !== '')

  const isDraftMode = Boolean(draftStatus)
  const isActionButtonDisabled =
    isSaving ||
    (!isDraftMode &&
      (uploadState !== 3 || !isRequiredMetadataComplete || !isAdditionalMetadataComplete))

  useEffect(() => {
    if (!selectedProfile) {
      setSelectedAccessLevel('')
    }
  }, [selectedProfile, setSelectedAccessLevel])

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

  const handleSaveDraftClick = async () => {
    // Clear previous feedback before new attempt
    onDraftFeedbackDismiss()

    let previewInfo: DocPreviewInfo

    if (newRecordId) {
      previewInfo = {
        lokasiFolder: folderSelection.path,
        profilDokumen: selectedProfile,
        tahapKeselamatan: selectedAccessLevel,
        ringkasan,
        requiredMetadataValues,
        additionalMetadataValues,
        requiredMetadataFields: metadataRequired,
        additionalMetadataFields: metadataAdditional,
        newUploadedRecordId: newRecordId,
      }
    } else {
      previewInfo = {
        lokasiFolder: folderSelection.path,
        profilDokumen: selectedProfile,
        tahapKeselamatan: selectedAccessLevel,
        ringkasan,
        requiredMetadataValues,
        additionalMetadataValues,
        requiredMetadataFields: metadataRequired,
        additionalMetadataFields: metadataAdditional,
      }
    }

    try {
      await onSaveDraft(previewInfo)
      // Success is handled by parent component's draft feedback state
    } catch (error) {
      // Error is handled by parent component's draft feedback state
      console.error('Draft save failed:', error)
    }
  }

  const handlePreviewClick = async () => {
    // Clear previous feedback before new attempt
    onDraftFeedbackDismiss()

    let previewInfo: DocPreviewInfo

    if (newRecordId) {
      previewInfo = {
        lokasiFolder: folderSelection.path,
        profilDokumen: selectedProfile,
        tahapKeselamatan: selectedAccessLevel,
        ringkasan,
        requiredMetadataValues,
        additionalMetadataValues,
        requiredMetadataFields: metadataRequired,
        additionalMetadataFields: metadataAdditional,
        newUploadedRecordId: newRecordId,
      }
    } else {
      previewInfo = {
        lokasiFolder: folderSelection.path,
        profilDokumen: selectedProfile,
        tahapKeselamatan: selectedAccessLevel,
        ringkasan,
        requiredMetadataValues,
        additionalMetadataValues,
        requiredMetadataFields: metadataRequired,
        additionalMetadataFields: metadataAdditional,
      }
    }

    // Save as draft first before showing preview
    try {
      await onSaveDraft(previewInfo)
      // Only set preview on successful save
      onPreview(previewInfo)
    } catch (error) {
      // Error is handled by parent component's draft feedback state
      // Do not proceed with preview
      console.error('Draft save failed, preview not shown:', error)
    }
  }

  const handleResetForm = () => {
    // Reset form-local controlled state
    setSelectedProfile('')
    // Reset will be handled by parent calling resetDraft via onReset
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
          <>
            <div className="flex flex-col gap-1.5">
              <div>Profil Dokumen</div>
              <DropdownWithSearch
                options={profileDokumenOptions}
                value={selectedProfile}
                onValueChange={setSelectedProfile}
                className="w-full font-normal"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div>Tarikh Dokumen</div>
              <DatePicker
                locale="ms"
                placeholder="Pilih Tarikh"
                value={parseDocumentDateValue(savedRecordDate)}
                onValueChange={(date) =>
                  setSavedRecordDate(date ? formatDocumentDateValue(date) : '')
                }
              />
            </div>
          </>
        )}
        {selectedProfile && savedRecordDate && (
          <>
            <div className="flex flex-col gap-1.5">
              <div>Tahap Keselamatan</div>
              <SelectDropdownMyds
                accessLevel={accessLevelArray}
                selectedAccessLevel={selectedAccessLevel}
                setSelectedAccessLevel={setSelectedAccessLevel}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div>Ringkasan (Pilihan)</div>
              <TextArea value={ringkasan} onChange={(e) => setRingkasan(e.target.value)} />
            </div>
            {retentionPeriod && (
              <div className="flex flex-col gap-1.5">
                <div>Tempoh Simpanan</div>
                <Input disabled value={retentionPeriod} readOnly />
              </div>
            )}
          </>
        )}
      </div>
      {selectedProfile && savedRecordDate && (
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
            lastUploadedFile={lastUploadedFile}
            draftStatus={draftStatus}
          />
          <div className="flex flex-col gap-3 text-body-md font-medium text-txt-black-700">
            <div className="text-body-md font-semibold font-body text-txt-black-900">
              Dublin Core (Metadata)
            </div>
            {metadataRequired.map((field) => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <div className="flex">
                  {field.title}
                  {field.required && <div className="text-txt-danger">*</div>}
                </div>
                {field.type === 'date' ? (
                  <DatePicker
                    locale="ms"
                    placeholder="Pilih Tarikh"
                    value={parseDateValue(requiredMetadataValues[field.key] || '')}
                    onValueChange={(date) =>
                      setRequiredMetadataField(field.key, formatDateValue(date))
                    }
                  />
                ) : (
                  <Input
                    type="text"
                    value={requiredMetadataValues[field.key] || ''}
                    onChange={(e) => setRequiredMetadataField(field.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3 text-body-md font-medium text-txt-black-700">
            {metadataAdditional.length > 0 && (
              <div className="text-body-md font-semibold font-body text-txt-black-900">
                Metadata Tambahan (Repositori)
              </div>
            )}
            {metadataAdditional.map((field) => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <div className="flex">
                  {field.title}
                  {field.required && <div className="text-txt-danger">*</div>}
                </div>
                {field.type === 'date' ? (
                  <DatePicker
                    locale="ms"
                    placeholder="Pilih Tarikh"
                    value={parseDateValue(additionalMetadataValues[field.key] || '')}
                    onValueChange={(date) =>
                      setAdditionalMetadataField(field.key, formatDateValue(date))
                    }
                  />
                ) : (
                  <Input
                    type="text"
                    value={additionalMetadataValues[field.key] || ''}
                    onChange={(e) => setAdditionalMetadataField(field.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <div>Versi</div>
            <Input disabled value={version} readOnly />
          </div>
          <div className="flex justify-between">
            <Button
              variant="default-outline"
              disabled={isActionButtonDisabled}
              onClick={handleSaveDraftClick}
            >
              Simpan Draf
            </Button>
            <Button
              variant="primary-outline"
              disabled={isActionButtonDisabled}
              onClick={handlePreviewClick}
            >
              Muat Naik Pratonton
            </Button>
          </div>
          {titleFallbackNotice && (
            <Callout variant="info">
              <CalloutTitle>Makluman Tajuk Dokumen</CalloutTitle>
              <CalloutContent>{titleFallbackNotice}</CalloutContent>
            </Callout>
          )}
          {draftFeedback && (
            <Callout variant={draftFeedback.status === 'success' ? 'success' : 'danger'}>
              <CalloutTitle>
                {draftFeedback.status === 'success' ? 'Success' : 'Error'}
              </CalloutTitle>
              <CalloutContent>
                <span className="flex flex-col gap-1">
                  <span>{draftFeedback.message}</span>
                  {draftFeedback.errorDetail && (
                    <span className="text-body-sm">{draftFeedback.errorDetail}</span>
                  )}
                </span>
              </CalloutContent>
            </Callout>
          )}
        </>
      )}
    </>
  )
}
