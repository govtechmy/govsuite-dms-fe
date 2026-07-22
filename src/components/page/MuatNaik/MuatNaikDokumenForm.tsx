import { Button } from '@govtechmy/myds-react/button'
import { ReloadIcon } from '@govtechmy/myds-react/icon'
import { useEffect, useMemo } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUploadStore } from '@/store/UploadStore'
import { useUploadDraftStore } from '@/store/UploadDraftStore'
import { useFolderLocationStore } from '@/store/FolderLocationStore'
import { useAuthStore } from '@/store/AuthStore'
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
import {
  buildMetadataDefaultValues,
  createUploadFormSchema,
  type UploadFormValues,
} from '@/schemas/uploadFormSchema'
import { normalizeMetadataKey } from '@/utils/normalizeMetadataKey'

const CREATOR_METADATA_KEY = normalizeMetadataKey('NAMA_PEWUJUD')

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
  draftStatus?: boolean
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
  const fullName = useAuthStore((state) => state.user?.fullName ?? '')
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
  const { selectedFile, setSelectedFile } = useUploadStore()

  const profileDokumenOptions = dropdownJenisDokumen.map((item) => item.documentProfile)
  const creatorMetadataField = useMemo(
    () =>
      metadataRequired.find((field) => normalizeMetadataKey(field.key) === CREATOR_METADATA_KEY),
    [metadataRequired]
  )

  const isDraftMode = Boolean(draftStatus)

  const hasTitleFallback = Boolean(
    selectedFile?.body?.fileName?.trim() ||
    selectedFile?.name?.trim() ||
    lastUploadedFile?.name?.trim() ||
    previewDocumentInfoData?.fileName?.trim()
  )

  const uploadFormSchema = useMemo(
    () =>
      createUploadFormSchema({
        requiredFields: metadataRequired,
        additionalFields: metadataAdditional,
        enforceRequired: !isDraftMode,
        hasTitleFallback,
      }),
    [metadataRequired, metadataAdditional, isDraftMode, hasTitleFallback]
  )

  const toIsoRecordDate = (value: string): string => {
    if (!value) {
      return ''
    }

    const parsedIsoDate = parseDateValue(value)
    if (parsedIsoDate) {
      return value
    }

    const parsedDocumentDate = parseDocumentDateValue(value)
    return parsedDocumentDate ? formatDateValue(parsedDocumentDate) : ''
  }

  const areMetadataMapsEqual = (
    firstMap: Record<string, string>,
    secondMap: Record<string, string>
  ): boolean => {
    const firstKeys = Object.keys(firstMap)
    const secondKeys = Object.keys(secondMap)

    if (firstKeys.length !== secondKeys.length) {
      return false
    }

    return firstKeys.every((key) => firstMap[key] === secondMap[key])
  }

  const {
    control,
    getValues,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    mode: 'onChange',
    defaultValues: {
      selectedAccessLevel,
      ringkasan,
      savedRecordDate: toIsoRecordDate(savedRecordDate),
      requiredMetadataValues: buildMetadataDefaultValues(metadataRequired, requiredMetadataValues),
      additionalMetadataValues: buildMetadataDefaultValues(
        metadataAdditional,
        additionalMetadataValues
      ),
    },
  })

  const watchedRequiredMetadataValues =
    useWatch({
      control,
      name: 'requiredMetadataValues',
    }) ?? {}

  const watchedAdditionalMetadataValues =
    useWatch({
      control,
      name: 'additionalMetadataValues',
    }) ?? {}

  const isRequiredMetadataComplete = metadataRequired
    .filter((field) => field.required)
    .every((field) => watchedRequiredMetadataValues[field.key]?.trim() !== '')

  const isAdditionalMetadataComplete = metadataAdditional
    .filter((field) => field.required)
    .every((field) => watchedAdditionalMetadataValues[field.key]?.trim() !== '')

  const isActionButtonDisabled =
    isSaving ||
    (!isDraftMode &&
      (uploadState !== 3 ||
        !isRequiredMetadataComplete ||
        !isAdditionalMetadataComplete ||
        !isValid))

  const requiredMetadataErrors =
    (errors.requiredMetadataValues as Partial<Record<string, { message?: string }>> | undefined) ??
    {}
  const additionalMetadataErrors =
    (errors.additionalMetadataValues as
      Partial<Record<string, { message?: string }>> | undefined) ?? {}

  const getErrorMessage = (value?: string): string | null => {
    return value && value.trim() ? value : null
  }

  useEffect(() => {
    if (!selectedProfile) {
      setSelectedAccessLevel('')
      setValue('selectedAccessLevel', '', { shouldValidate: true })
    }
  }, [selectedProfile, setSelectedAccessLevel, setValue])

  useEffect(() => {
    if (selectedAccessLevel !== getValues('selectedAccessLevel')) {
      setValue('selectedAccessLevel', selectedAccessLevel, { shouldValidate: true })
    }
  }, [selectedAccessLevel, getValues, setValue])

  useEffect(() => {
    if (ringkasan !== getValues('ringkasan')) {
      setValue('ringkasan', ringkasan, { shouldValidate: false })
    }
  }, [ringkasan, getValues, setValue])

  useEffect(() => {
    const normalizedDateValue = toIsoRecordDate(savedRecordDate)
    if (normalizedDateValue !== getValues('savedRecordDate')) {
      setValue('savedRecordDate', normalizedDateValue, { shouldValidate: true })
    }
  }, [savedRecordDate, getValues, setValue])

  useEffect(() => {
    const updatedRequiredValues = buildMetadataDefaultValues(
      metadataRequired,
      requiredMetadataValues
    )
    if (!areMetadataMapsEqual(updatedRequiredValues, getValues('requiredMetadataValues'))) {
      setValue('requiredMetadataValues', updatedRequiredValues, { shouldValidate: true })
    }
  }, [metadataRequired, requiredMetadataValues, getValues, setValue])

  useEffect(() => {
    const updatedAdditionalValues = buildMetadataDefaultValues(
      metadataAdditional,
      additionalMetadataValues
    )
    if (!areMetadataMapsEqual(updatedAdditionalValues, getValues('additionalMetadataValues'))) {
      setValue('additionalMetadataValues', updatedAdditionalValues, { shouldValidate: true })
    }
  }, [metadataAdditional, additionalMetadataValues, getValues, setValue])

  useEffect(() => {
    if (!creatorMetadataField) {
      return
    }

    const creatorFieldName = `requiredMetadataValues.${creatorMetadataField.key}` as const
    const normalizedFullName = fullName.trim()
    const currentFormValue = (getValues(creatorFieldName) ?? '').trim()
    const currentStoreValue = (requiredMetadataValues[creatorMetadataField.key] ?? '').trim()

    if (currentFormValue !== normalizedFullName) {
      setValue(creatorFieldName, normalizedFullName, { shouldValidate: true })
    }

    if (currentStoreValue !== normalizedFullName) {
      setRequiredMetadataField(creatorMetadataField.key, normalizedFullName)
    }
  }, [
    creatorMetadataField,
    fullName,
    getValues,
    requiredMetadataValues,
    setRequiredMetadataField,
    setValue,
  ])

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

    const isFormValid = await trigger()
    if (!isFormValid) {
      return
    }

    const formValues = uploadFormSchema.parse(getValues())

    let previewInfo: DocPreviewInfo

    if (newRecordId) {
      previewInfo = {
        lokasiFolder: folderSelection.path,
        profilDokumen: selectedProfile,
        tahapKeselamatan: formValues.selectedAccessLevel,
        ringkasan: formValues.ringkasan,
        requiredMetadataValues: formValues.requiredMetadataValues,
        additionalMetadataValues: formValues.additionalMetadataValues,
        requiredMetadataFields: metadataRequired,
        additionalMetadataFields: metadataAdditional,
        newUploadedRecordId: newRecordId,
      }
    } else {
      previewInfo = {
        lokasiFolder: folderSelection.path,
        profilDokumen: selectedProfile,
        tahapKeselamatan: formValues.selectedAccessLevel,
        ringkasan: formValues.ringkasan,
        requiredMetadataValues: formValues.requiredMetadataValues,
        additionalMetadataValues: formValues.additionalMetadataValues,
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

    const isFormValid = await trigger()
    if (!isFormValid) {
      return
    }

    const formValues = uploadFormSchema.parse(getValues())

    let previewInfo: DocPreviewInfo

    if (newRecordId) {
      previewInfo = {
        lokasiFolder: folderSelection.path,
        profilDokumen: selectedProfile,
        tahapKeselamatan: formValues.selectedAccessLevel,
        ringkasan: formValues.ringkasan,
        requiredMetadataValues: formValues.requiredMetadataValues,
        additionalMetadataValues: formValues.additionalMetadataValues,
        requiredMetadataFields: metadataRequired,
        additionalMetadataFields: metadataAdditional,
        newUploadedRecordId: newRecordId,
      }
    } else {
      previewInfo = {
        lokasiFolder: folderSelection.path,
        profilDokumen: selectedProfile,
        tahapKeselamatan: formValues.selectedAccessLevel,
        ringkasan: formValues.ringkasan,
        requiredMetadataValues: formValues.requiredMetadataValues,
        additionalMetadataValues: formValues.additionalMetadataValues,
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
          <div className="flex">
            Lokasi Folder <div className="text-txt-danger">*</div>
          </div>
          <ModalLokasiFolder selectedPath={folderSelection.path} />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex">
            Muat Naik ke Folder Unit <div className="text-txt-danger">*</div>
          </div>
          <SelectDropdownUnit
            dropdownUnits={dropdownUnits}
            selectedUnit={selectedUnit}
            onUnitChange={onUnitChange}
          />
        </div>

        {selectedUnit && (
          <>
            <div className="flex flex-col gap-1.5">
              <div className="flex">
                Profil Dokumen <div className="text-txt-danger">*</div>
              </div>
              <DropdownWithSearch
                options={profileDokumenOptions}
                value={selectedProfile}
                onValueChange={setSelectedProfile}
                className="w-full font-normal"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex">
                Tarikh Dokumen <div className="text-txt-danger">*</div>
              </div>
              <Controller
                name="savedRecordDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    locale="ms"
                    placeholder="Pilih Tarikh"
                    value={parseDateValue(field.value || '')}
                    onValueChange={(date) => {
                      const nextIsoValue = date ? formatDateValue(date) : ''
                      field.onChange(nextIsoValue)
                      setSavedRecordDate(date ? formatDocumentDateValue(date) : '')
                    }}
                  />
                )}
              />
              {getErrorMessage(errors.savedRecordDate?.message) && (
                <div className="text-body-sm text-danger-700">
                  {getErrorMessage(errors.savedRecordDate?.message)}
                </div>
              )}
            </div>
          </>
        )}
        {selectedProfile && savedRecordDate && (
          <>
            <div className="flex flex-col gap-1.5">
              <div className="flex">
                Tahap Keselamatan <div className="text-txt-danger">*</div>
              </div>
              <Controller
                name="selectedAccessLevel"
                control={control}
                render={({ field }) => (
                  <SelectDropdownMyds
                    accessLevel={accessLevelArray}
                    selectedAccessLevel={field.value || ''}
                    setSelectedAccessLevel={(value) => {
                      field.onChange(value)
                      setSelectedAccessLevel(value)
                    }}
                  />
                )}
              />
              {getErrorMessage(errors.selectedAccessLevel?.message) && (
                <div className="text-body-sm text-danger-700">
                  {getErrorMessage(errors.selectedAccessLevel?.message)}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <div>Ringkasan (Pilihan)</div>
              <Controller
                name="ringkasan"
                control={control}
                render={({ field }) => (
                  <TextArea
                    value={field.value || ''}
                    onChange={(event) => {
                      field.onChange(event.target.value)
                      setRingkasan(event.target.value)
                    }}
                  />
                )}
              />
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
                <Controller
                  name={`requiredMetadataValues.${field.key}` as const}
                  control={control}
                  render={({ field: metadataField }) => {
                    const isCreatorField = normalizeMetadataKey(field.key) === CREATOR_METADATA_KEY

                    return isCreatorField ? (
                      <Input type="text" disabled readOnly value={metadataField.value || ''} />
                    ) : field.type === 'date' ? (
                      <DatePicker
                        locale="ms"
                        placeholder="Pilih Tarikh"
                        value={parseDateValue(metadataField.value || '')}
                        onValueChange={(date) => {
                          const nextValue = date ? formatDateValue(date) : ''
                          metadataField.onChange(nextValue)
                          setRequiredMetadataField(field.key, nextValue)
                        }}
                      />
                    ) : (
                      <Input
                        type="text"
                        value={metadataField.value || ''}
                        onChange={(event) => {
                          metadataField.onChange(event.target.value)
                          setRequiredMetadataField(field.key, event.target.value)
                        }}
                      />
                    )
                  }}
                />
                {getErrorMessage(requiredMetadataErrors[field.key]?.message) && (
                  <div className="text-body-sm text-danger-700">
                    {getErrorMessage(requiredMetadataErrors[field.key]?.message)}
                  </div>
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
                <Controller
                  name={`additionalMetadataValues.${field.key}` as const}
                  control={control}
                  render={({ field: metadataField }) =>
                    field.type === 'date' ? (
                      <DatePicker
                        locale="ms"
                        placeholder="Pilih Tarikh"
                        value={parseDateValue(metadataField.value || '')}
                        onValueChange={(date) => {
                          const nextValue = date ? formatDateValue(date) : ''
                          metadataField.onChange(nextValue)
                          setAdditionalMetadataField(field.key, nextValue)
                        }}
                      />
                    ) : (
                      <Input
                        type="text"
                        value={metadataField.value || ''}
                        onChange={(event) => {
                          metadataField.onChange(event.target.value)
                          setAdditionalMetadataField(field.key, event.target.value)
                        }}
                      />
                    )
                  }
                />
                {getErrorMessage(additionalMetadataErrors[field.key]?.message) && (
                  <div className="text-body-sm text-danger-700">
                    {getErrorMessage(additionalMetadataErrors[field.key]?.message)}
                  </div>
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
