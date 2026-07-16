import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import type { DocPreviewInfo } from '@/components/page/MuatNaik/MuatNaikDokumenForm'
import MuatNaikDokumenForm from '@/components/page/MuatNaik/MuatNaikDokumenForm'
import PratontonRekod from '@/components/page/MuatNaik/PratontonRekod'
import { useState, useEffect, useRef } from 'react'
import { clx } from '@govtechmy/myds-react/utils'
import {
  getAccessLevels,
  getDropdownUnits,
  type AccessLevel,
  type DropdownUnit,
  type ProfileDocument,
  getProfileDocumentsByUnit,
} from '@/services/dropdown.svc'
import {
  requestPresignedUploadUrl,
  uploadFileToPresignedUrl,
  type MetadataField,
  type PresignUploadResponse,
  saveOrUpdateUploadedRecord,
  type SaveUploadRecordRequest,
  getProfileDocumentConfig,
} from '@/services/upload.svc'
import ProgressResultChecker, { type ProgressState } from '@/components/shared/ProgressResult'
import extractBackendError from '@/utils/extractBackendError'
import { convertDdMmYyToIso, formatDocumentDateValue } from '@/utils/formatDate'
import convertPathFormat from '@/utils/convertPathFormat'
import { useFolderLocationStore } from '@/store/FolderLocationStore'
import { useUploadStore } from '@/store/UploadStore'
import { useUploadDraftStore } from '@/store/UploadDraftStore'
import { useNavigate, useParams } from 'react-router-dom'
import { getRecordInfo } from '@/services/getRecordInfo.svc'
import { sanitizePathID } from '@/utils/sanitizePathID'
import {
  buildPrefilledMetadataValues,
  toMetadataValueMap,
  type MetadataValueMap,
} from '@/utils/metadataPrefill'
import type { FileInfo } from '@/components/shared/UploadDocument'

type DraftFeedback = {
  status: 'success' | 'error'
  message: string
  errorDetail?: string
} | null

type BuildSaveRecordPayloadResult = {
  payload: SaveUploadRecordRequest
  usedTitleFallback: boolean
}

export default function MuatNaikDokumenIDPage() {
  const [selectedProfile, setSelectedProfile] = useState<string>('')
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [selectedProfileDetail, setSelectedProfileDetail] = useState<ProfileDocument | null>(null)
  const [accessLevelArray, setAccessLevelArray] = useState<AccessLevel[]>([])
  const [allInfoDocs, setAllInfoDocs] = useState<DocPreviewInfo | null>(null)
  const [dropdownUnits, setDropdownUnits] = useState<DropdownUnit[]>([])
  const [dropdownJenisDokumen, setDropdownJenisDokumen] = useState<ProfileDocument[]>([])
  const [selectedUnitsFromDropdown, setSelectedUnitsFromDropdown] = useState<string | undefined>()
  const [metadataRequired, setMetadataRequired] = useState<MetadataField[]>([])
  const [metadataAdditional, setMetadataAdditional] = useState<MetadataField[]>([])
  const [retentionPeriod, setRetentionPeriod] = useState<string>('')
  const [presignedResponse, setPresignedResponse] = useState<PresignUploadResponse | null>(null)
  const [mongoDbRecordId, setMongoDbRecordId] = useState<string>('')
  const [uploadPercentage, setUploadPercentage] = useState<number>(0)
  const [submissionProgress, setSubmissionProgress] = useState<ProgressState>(null)
  const [submissionError, setSubmissionError] = useState<{ code: string; message: string } | null>(
    null
  )
  const [draftFeedback, setDraftFeedback] = useState<DraftFeedback>(null)
  const [titleFallbackNotice, setTitleFallbackNotice] = useState<string | null>(null)
  const [savedRecordDate, setSavedRecordDate] = useState<string>('')
  const [version, setVersion] = useState<string>('Version : ')
  const [recordMetadataValues, setRecordMetadataValues] = useState<MetadataValueMap>({})
  const [lastUploadedFile, setLastUploadedFile] = useState<FileInfo | null>(null)
  const [draftStatus, setDraftStatus] = useState<boolean>(false)
  const [newRecordId, setNewRecordId] = useState<string>('')

  // In-flight guard to prevent duplicate save submissions
  const isSavingRef = useRef(false)

  // Zustand stores for folder and upload context
  const { folderSelection, setFolderSelection, resetFolderSelection } = useFolderLocationStore()
  const { selectedFile, setSelectedFile } = useUploadStore()
  const {
    resetDraft,
    setSelectedAccessLevel,
    setRingkasan,
    replaceRequiredMetadata,
    replaceAdditionalMetadata,
  } = useUploadDraftStore()
  const navigate = useNavigate()
  const { MuatNaikDokumenID } = useParams<{ MuatNaikDokumenID: string }>()

  // Clear persisted upload context when leaving this page.
  useEffect(() => {
    return () => {
      setSelectedFile(null)
      resetFolderSelection()
      resetDraft()
    }
  }, [setSelectedFile, resetFolderSelection, resetDraft])

  /**
   * Unified reset function: clears all page and store state for fresh upload flow
   * Used by Set Semula button and after successful submission
   */
  const resetUploadFlowState = () => {
    // Clear page-level states
    setAllInfoDocs(null)
    setSelectedProfile('')
    setSelectedProfileId('')
    setSelectedProfileDetail(null)
    setSelectedUnitsFromDropdown(undefined)
    setDropdownJenisDokumen([])
    setMetadataRequired([])
    setMetadataAdditional([])
    setPresignedResponse(null)
    setMongoDbRecordId('')
    setUploadPercentage(0)
    setDraftFeedback(null)
    setSubmissionError(null)
    setSubmissionProgress(null)
    setTitleFallbackNotice(null)
    setRetentionPeriod('')
    setSavedRecordDate('')
    setRecordMetadataValues({})
    setLastUploadedFile(null)
    setNewRecordId('')

    // Clear global store states
    setSelectedFile(null)
    resetFolderSelection()
    resetDraft()
  }

  /**
   * Build SaveUploadRecordRequest payload from current state and form/preview info
   */
  const buildSaveRecordPayload = (
    previewInfo: DocPreviewInfo,
    status: string
  ): BuildSaveRecordPayloadResult => {
    // Guard required fields
    if (!newRecordId.trim() && !MuatNaikDokumenID?.trim()) {
      throw new Error('Missing recordId from upload context')
    }
    if (!folderSelection.id) {
      throw new Error('Missing folderId - please select a folder location')
    }
    if (!selectedUnitsFromDropdown) {
      throw new Error('Missing unitId from selected unit')
    }
    if (!selectedProfileDetail?.definitionGroupId) {
      throw new Error('Missing recordConfig from selected profile')
    }
    const hasExistingDraftFile = draftStatus && Boolean(lastUploadedFile?.name)
    const hasFileContext = Boolean(
      selectedFile?.name || presignedResponse?.fileName || hasExistingDraftFile
    )
    if (!hasFileContext) {
      throw new Error('Missing file information - please upload a file')
    }
    if (!previewInfo.tahapKeselamatan) {
      throw new Error('Missing accessLevel - please select security level')
    }

    const recordDate = convertDdMmYyToIso(savedRecordDate) ?? new Date().toISOString()
    const year = new Date(recordDate).getUTCFullYear()

    // Extract file metadata from newest upload first, then fallback to existing draft file.
    const fileName =
      presignedResponse?.fileName || selectedFile?.name || lastUploadedFile?.name || ''
    const fileType =
      presignedResponse?.fileType || selectedFile?.type || lastUploadedFile?.type || ''
    const fileExtension =
      presignedResponse?.fileExtension ||
      selectedFile?.name?.split('.').pop() ||
      lastUploadedFile?.extension ||
      ''
    const fileSize =
      presignedResponse?.fileSize || selectedFile?.size || Number(lastUploadedFile?.sizeMb ?? 0)

    const tajukMetadataValue =
      Object.entries(previewInfo.requiredMetadataValues).find(
        ([key]) => key.trim().toUpperCase() === 'TAJUK'
      )?.[1] ?? ''
    const normalizedTajukMetadataValue = tajukMetadataValue.trim()
    const fallbackFileName =
      selectedFile?.body?.fileName?.trim() || lastUploadedFile?.name?.trim() || fileName.trim()
    const title = normalizedTajukMetadataValue || fallbackFileName

    if (!title) {
      throw new Error('Missing title information - TAJUK metadata or file name is required')
    }

    const usedTitleFallback = !normalizedTajukMetadataValue && Boolean(fallbackFileName)

    // Merge metadata: required metadata + additional metadata
    const mergedMetadata: Record<string, unknown> = {
      ...previewInfo.requiredMetadataValues,
      ...previewInfo.additionalMetadataValues,
    }

    const payload: SaveUploadRecordRequest = {
      title,
      recordId: newRecordId ? newRecordId : (MuatNaikDokumenID ?? ''),
      fileName,
      fileType,
      fileExtension,
      fileSize,
      folderId: folderSelection.id,
      recordDescription: previewInfo.ringkasan || '',
      recordDate,
      // Removed for the moment
      // reference: '',
      unitId: selectedUnitsFromDropdown,
      year,
      // Removed for the moment
      // classification: ' CLASSIFICATION OF WHAT',
      accessLevel: previewInfo.tahapKeselamatan,
      // Removed for the moment
      // retentionPeriod: '7 DAYS MORE',
      isLatest: true,
      metadata: mergedMetadata,
      recordConfig: selectedProfileDetail.definitionGroupId,
      status: status,
    }

    return {
      payload,
      usedTitleFallback,
    }
  }

  /**
   * Shared mutation utility: calls saveUploadedRecord with standardized error handling
   * For DRAF workflow: sets draftFeedback state (inline callout)
   * For DALAM_SEMAKAN workflow: sets submissionProgress state (full-screen modal)
   */
  const executeSaveRecord = async (previewInfo: DocPreviewInfo, status: string): Promise<void> => {
    // Guard duplicate submissions
    if (isSavingRef.current) {
      console.warn('Save already in progress, ignoring duplicate request')
      return
    }

    isSavingRef.current = true

    // Only set full-screen progress for final submission, not draft
    if (status === 'DALAM_SEMAKAN') {
      setSubmissionProgress('loading')
      setSubmissionError(null)
    }

    setTitleFallbackNotice(null)

    try {
      const { payload, usedTitleFallback } = buildSaveRecordPayload(previewInfo, status)

      if (usedTitleFallback) {
        setTitleFallbackNotice('Metadata TAJUK tidak ditemui. Nama fail digunakan sebagai tajuk.')
      }

      const result = await saveOrUpdateUploadedRecord(payload, mongoDbRecordId)

      // Persist MongoDB ID from backend response for future PUT operations
      if (result.id) {
        setMongoDbRecordId(result.id)
      }

      if (status === 'DALAM_SEMAKAN') {
        setSubmissionProgress('success')
      }
    } catch (error) {
      console.error('Error saving uploaded record:', error)
      const backendError = extractBackendError(error)

      if (status === 'DALAM_SEMAKAN') {
        setSubmissionError({
          code: backendError?.code ?? 'SAVE_FAILED',
          message:
            backendError?.message ??
            (error instanceof Error ? error.message : 'Permintaan simpan dokumen gagal diproses.'),
        })
        setSubmissionProgress('error')
      }

      throw error // Re-throw so caller can handle flow control
    } finally {
      isSavingRef.current = false
    }
  }

  // Handle S3 upload from file selection in Muat Naik card
  const handleUploadToS3 = async (file: File): Promise<void> => {
    if (!selectedProfileDetail?.definitionGroupId) {
      throw new Error('Missing recordConfig (definitionGroupId) from selected profile')
    }

    setUploadPercentage(0)

    // Step 1: Build presign payload
    const recordDate = convertDdMmYyToIso(savedRecordDate) ?? new Date().toISOString()
    const fileExtension = file.name.split('.').pop() ?? ''
    const presignPayload = {
      fileName: file.name,
      fileType: file.type,
      fileExtension,
      fileSize: parseFloat((file.size / 1048576).toFixed(1)),
      recordConfig: selectedProfileDetail.definitionGroupId,
      recordDate,
    }

    // Step 2: Request presigned URL
    const presignedData = await requestPresignedUploadUrl(presignPayload)

    // Step 3: Save full presigned response to state for future use
    setPresignedResponse(presignedData)
    //use this later on if upload new docs
    setNewRecordId(presignedData.recordId)

    if (!presignedData.presignedUrl || !presignedData.recordId) {
      throw new Error('Invalid presigned response: missing presignedUrl or recordId')
    }

    // Step 4: Upload file to S3 with progress tracking
    await uploadFileToPresignedUrl({
      presignedUrl: presignedData.presignedUrl,
      file,
      fileType: file.type,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100)
          setUploadPercentage(Math.min(percentage, 100))
        }
      },
    })

    setUploadPercentage(100)

    // Step 5: Check upload status by recordId
    // const statusResponse = await getUploadStatus(presignedData.recordId)
  }

  /**
   * Handle Simpan Draf: save record with DRAF workflow state
   * Shows inline feedback callout, does not navigate away
   */
  const handleSaveDraft = async (previewInfo: DocPreviewInfo): Promise<void> => {
    // Clear previous feedback
    setDraftFeedback(null)

    try {
      await executeSaveRecord(previewInfo, 'DRAF')
      // Set success feedback for inline callout
      setDraftFeedback({
        status: 'success',
        message: 'Success',
      })
    } catch (error) {
      // Set error feedback for inline callout
      const backendError = extractBackendError(error)
      setDraftFeedback({
        status: 'error',
        message: 'Please try again',
        errorDetail:
          backendError?.message ??
          (error instanceof Error ? error.message : 'Permintaan simpan dokumen gagal diproses.'),
      })
      // Do not proceed with any additional flow
    }
  }

  /**
   * Handle final submission: save record with DALAM_SEMAKAN workflow state
   */
  const handleSubmitDokumen = async () => {
    if (!allInfoDocs) {
      console.error('Cannot submit: preview info is missing')
      return
    }

    try {
      await executeSaveRecord(allInfoDocs, 'DALAM_SEMAKAN')
      // Success state is already set by executeSaveRecord
    } catch {
      // Error state is already set by executeSaveRecord
    }
  }

  // Fetch access levels from API
  useEffect(() => {
    const fetchAccessLevels = async () => {
      try {
        const data = await getAccessLevels()
        setAccessLevelArray(data)
      } catch (error) {
        console.error('Error fetching access levels:', error)
        setAccessLevelArray([])
      }
    }
    const fetchDropdownDataUnit = async () => {
      try {
        const unitsData = await getDropdownUnits()
        setDropdownUnits(unitsData)
      } catch (err) {
        console.error('Error fetching dropdown data:', err)
      }
    }

    const fetchRecordInformation = async () => {
      try {
        if (MuatNaikDokumenID) {
          const fullRecordInformation = await getRecordInfo(MuatNaikDokumenID)
          const fullRecordInformationData = fullRecordInformation.data

          if (fullRecordInformationData) {
            setDraftStatus(true)
          }

          // Set Lokasi Folder using record information
          if (fullRecordInformationData.folderId && fullRecordInformationData.filePath) {
            const formattedPath = convertPathFormat(
              sanitizePathID(fullRecordInformationData.filePath, MuatNaikDokumenID)
            )
            setFolderSelection({
              id: fullRecordInformationData.folderId,
              path: formattedPath,
            })
          }

          // Set Muat Naik Ke Folder Unit using record information
          if (fullRecordInformationData.unitId) {
            setSelectedUnitsFromDropdown(fullRecordInformationData.unitId)
          }

          // Set Profile Document Code using record information
          if (fullRecordInformationData.documentProfileName) {
            setSelectedProfile(fullRecordInformationData.documentProfileName)
          }

          if (fullRecordInformationData.recordConfigId) {
            setSelectedProfileId(fullRecordInformationData.recordConfigId)
          }

          // set recordDate using .recordDate
          if (fullRecordInformationData.recordDate) {
            const date = new Date(fullRecordInformationData.recordDate)
            setSavedRecordDate(formatDocumentDateValue(date))
          }

          if (fullRecordInformationData.accessLevel) {
            setSelectedAccessLevel(fullRecordInformationData.accessLevel)
          }

          if (fullRecordInformationData.recordDescription) {
            setRingkasan(fullRecordInformationData.recordDescription)
          }

          if (fullRecordInformationData.metadata) {
            const mappedMetadataValues = toMetadataValueMap(fullRecordInformationData.metadata)
            setRecordMetadataValues(mappedMetadataValues)
          }

          if (
            fullRecordInformationData.filePath &&
            fullRecordInformationData.fileType &&
            fullRecordInformationData.fileExtension &&
            fullRecordInformationData.fileSize &&
            fullRecordInformationData.fileName
          ) {
            const formattedPath = convertPathFormat(
              sanitizePathID(fullRecordInformationData.filePath, MuatNaikDokumenID)
            )

            setLastUploadedFile({
              path: String(formattedPath),
              type: String(fullRecordInformationData.fileType),
              extension: String(fullRecordInformationData.fileExtension),
              sizeMb: Number(fullRecordInformationData.fileSize),
              name: String(fullRecordInformationData.fileName),
            })
          } else {
            setLastUploadedFile(null)
          }

          if (
            fullRecordInformationData.recordConfigId &&
            fullRecordInformationData.definitionGroupId &&
            fullRecordInformationData.unitId &&
            fullRecordInformationData.workflowCode &&
            fullRecordInformationData.documentProfileCode &&
            fullRecordInformationData.documentProfileName &&
            fullRecordInformationData.accessLevel
          ) {
            setSelectedProfileDetail({
              id: fullRecordInformationData.recordConfigId,
              definitionGroupId: fullRecordInformationData.definitionGroupId,
              unitId: fullRecordInformationData.unitId,
              workflowCode: fullRecordInformationData.workflowCode,
              documentProfileCode: fullRecordInformationData.documentProfileCode,
              documentProfile: fullRecordInformationData.documentProfileName,
              defaultAccessLevel: fullRecordInformationData.accessLevel,
            })
          }

          if (fullRecordInformationData.version) {
            const versionStringify = `Versi : ${String(fullRecordInformationData.version)}`
            setVersion(versionStringify)
          }
          if (fullRecordInformationData.id) {
            setMongoDbRecordId(fullRecordInformationData.id)
          }
        }
      } catch (err) {
        console.error('Error fetching record information:', err)
      }
    }

    fetchAccessLevels()
    fetchDropdownDataUnit()
    fetchRecordInformation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [MuatNaikDokumenID])

  useEffect(() => {
    const fetchDropdownDataDocument = async () => {
      if (!selectedUnitsFromDropdown) {
        setDropdownJenisDokumen([])
        setSelectedProfile('')
        setSelectedProfileId('')
        setSelectedProfileDetail(null)
        setMetadataRequired([])
        setMetadataAdditional([])
        return
      }

      try {
        const response = await getProfileDocumentsByUnit(selectedUnitsFromDropdown)
        setDropdownJenisDokumen(response)
      } catch (err) {
        console.error('Error fetching profile documents:', err)
        setDropdownJenisDokumen([])
      }
    }
    fetchDropdownDataDocument()
  }, [selectedUnitsFromDropdown])

  useEffect(() => {
    if (!selectedProfileId) return

    const fetchProfileDocumentConfig = async () => {
      try {
        const unitsData = await getProfileDocumentConfig(selectedProfileId)
        setRetentionPeriod(unitsData?.retentionPeriod || '')
        setMetadataRequired(unitsData?.requiredMetadata || [])
        setMetadataAdditional(unitsData?.additionalMetadata || [])
      } catch (err) {
        console.error('Error fetching profile document config:', err)
        setMetadataRequired([])
        setMetadataAdditional([])
      }
    }
    fetchProfileDocumentConfig()
  }, [selectedProfileId])

  //useEffect to handle Prefilled data
  useEffect(() => {
    if (metadataRequired.length === 0 && metadataAdditional.length === 0) return

    const prefilledRequiredMetadata = buildPrefilledMetadataValues(
      metadataRequired,
      recordMetadataValues
    )
    const prefilledAdditionalMetadata = buildPrefilledMetadataValues(
      metadataAdditional,
      recordMetadataValues
    )

    replaceRequiredMetadata(prefilledRequiredMetadata)
    replaceAdditionalMetadata(prefilledAdditionalMetadata)
  }, [
    metadataRequired,
    metadataAdditional,
    recordMetadataValues,
    replaceRequiredMetadata,
    replaceAdditionalMetadata,
  ])

  const acceptedFileTypes = '.docx,.pdf'

  const handleUnitChange = (unitCode: string) => {
    setSelectedUnitsFromDropdown(unitCode)
    setSelectedProfile('')
    setSelectedProfileId('')
    setTitleFallbackNotice(null)
  }

  const handleProfileChange = (documentProfileCodeName: string) => {
    setSelectedProfile(documentProfileCodeName)
    setTitleFallbackNotice(null)
    const matchedProfile = dropdownJenisDokumen.find(
      (item) => item.documentProfile === documentProfileCodeName
    )
    if (matchedProfile) {
      setSelectedProfileId(matchedProfile.id)
      setSelectedProfileDetail(matchedProfile) // Backend currently names this definitionGroupId; used as recordConfig
    } else {
      setSelectedProfileId('')
      setSelectedProfileDetail(null)
    }
  }

  return (
    <>
      {submissionProgress === null && (
        <div className={clx('grid ', selectedProfile && savedRecordDate && 'grid-cols-2')}>
          <RightSidePageLayoutWrapper
            className={clx(
              'flex flex-col gap-6 w-full ',
              selectedProfile && savedRecordDate && 'shadow-card pr-6'
            )}
          >
            <MuatNaikDokumenForm
              dropdownJenisDokumen={dropdownJenisDokumen}
              acceptedFileTypes={acceptedFileTypes}
              accessLevelArray={accessLevelArray}
              selectedProfile={selectedProfile}
              setSelectedProfile={handleProfileChange}
              onPreview={setAllInfoDocs}
              onSaveDraft={handleSaveDraft}
              onReset={resetUploadFlowState}
              dropdownUnits={dropdownUnits}
              selectedUnit={selectedUnitsFromDropdown}
              onUnitChange={handleUnitChange}
              metadataRequired={metadataRequired}
              metadataAdditional={metadataAdditional}
              retentionPeriod={retentionPeriod}
              onUploadToS3={handleUploadToS3}
              uploadPercentage={uploadPercentage}
              isSaving={isSavingRef.current}
              draftFeedback={draftFeedback}
              onDraftFeedbackDismiss={() => setDraftFeedback(null)}
              titleFallbackNotice={titleFallbackNotice}
              savedRecordDate={savedRecordDate}
              setSavedRecordDate={setSavedRecordDate}
              version={version}
              lastUploadedFile={lastUploadedFile}
              draftStatus={draftStatus}
              newRecordId={newRecordId}
            />
          </RightSidePageLayoutWrapper>
          {selectedProfile && savedRecordDate && (
            <RightSidePageLayoutWrapper className="flex flex-col gap-6 w-full pr-3">
              <PratontonRekod docInfo={allInfoDocs} onSubmit={handleSubmitDokumen} />
            </RightSidePageLayoutWrapper>
          )}
        </div>
      )}

      {submissionProgress !== null && (
        <div className="flex w-full h-full">
          <ProgressResultChecker
            progress={submissionProgress}
            loadingDescription="Dokumen sedang dihantar untuk kelulusan. Sila tunggu sebentar."
            successTitle="Dokumen Berjaya Dihantar"
            successDescription="Dokumen telah berjaya dihantar dan sedang menunggu kelulusan."
            successButtonText="Kembali Ke Laman Utama"
            errorTitle="Dokumen Gagal Dihantar!"
            errorDescription={
              <div className="flex flex-col gap-2 items-center justify-center">
                <div>Dokumen gagal dihantar, sila cuba lagi atau hubungi pentadbir sistem.</div>
                <div>
                  {submissionError?.code ?? 'REQUEST_FAILED'} :{' '}
                  {submissionError?.message ?? 'Permintaan penghantaran gagal diproses.'}
                </div>
              </div>
            }
            errorButtonText="Kembali dan Cuba Lagi"
            navigateSuccess="/ms"
            onSuccessClick={() => {
              resetUploadFlowState()
              navigate('/ms')
            }}
            onErrorClick={() => setSubmissionProgress(null)}
          />
        </div>
      )}
    </>
  )
}
