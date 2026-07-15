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
  type DropdownJenisDokumen,
  getProfileDocumentsByUnit,
} from '@/services/dropdown.svc'
import {
  requestPresignedUploadUrl,
  uploadFileToPresignedUrl,
  getUploadStatus,
  type MetadataField,
  type PresignUploadResponse,
  saveOrUpdateUploadedRecord,
  type SaveUploadRecordRequest,
  getProfileDocumentConfig,
} from '@/services/upload.svc'
import ProgressResultChecker, { type ProgressState } from '@/components/shared/ProgressResult'
import extractBackendError from '@/utils/extractBackendError'
import { convertDdMmYyToIso } from '@/utils/formatDate'
import convertPathFormat from '@/utils/convertPathFormat'
import { useFolderLocationStore } from '@/store/FolderLocationStore'
import { useUploadStore } from '@/store/UploadStore'
import { useUploadDraftStore } from '@/store/UploadDraftStore'
import { useNavigate, useParams } from 'react-router-dom'
import { getRecordInfo } from '@/services/getRecordInfo.svc'

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
  const [selectedProfileDetail, setSelectedProfileDetail] = useState<DropdownJenisDokumen | null>(
    null
  )
  const [allInfoDocs, setAllInfoDocs] = useState<DocPreviewInfo | null>(null)
  const [peringkatKeselamatan, setPeringkatKeselamatan] = useState<AccessLevel[]>([])
  const [dropdownUnits, setDropdownUnits] = useState<DropdownUnit[]>([])
  const [dropdownJenisDokumen, setDropdownJenisDokumen] = useState<DropdownJenisDokumen[]>([])
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
  const [version, setVersion] = useState<string>('Version 1')
  setVersion("Version 1")

  // In-flight guard to prevent duplicate save submissions
  const isSavingRef = useRef(false)

  // Zustand stores for folder and upload context
  const { folderSelection, setFolderSelection, resetFolderSelection } = useFolderLocationStore()
  const { selectedFile, setSelectedFile } = useUploadStore()
  const { resetDraft } = useUploadDraftStore()
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
    if (!presignedResponse?.recordId) {
      throw new Error('Missing recordId from presigned upload response')
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
    if (!selectedFile?.name) {
      throw new Error('Missing file information - please upload a file')
    }
    if (!previewInfo.tahapKeselamatan) {
      throw new Error('Missing accessLevel - please select security level')
    }

    const recordDate = convertDdMmYyToIso(savedRecordDate) ?? new Date().toISOString()
    const year = new Date(recordDate).getUTCFullYear()

    // Extract file metadata from selectedFile and presignedResponse
    const fileName = presignedResponse.fileName || selectedFile.name
    const fileType = presignedResponse.fileType || selectedFile.type || ''
    const fileExtension =
      presignedResponse.fileExtension || selectedFile.name.split('.').pop() || ''
    const fileSize = presignedResponse.fileSize || selectedFile.size || 0

    const tajukMetadataValue =
      Object.entries(previewInfo.requiredMetadataValues).find(
        ([key]) => key.trim().toUpperCase() === 'TAJUK'
      )?.[1] ?? ''
    const normalizedTajukMetadataValue = tajukMetadataValue.trim()
    const fallbackFileName =
      selectedFile.body?.fileName?.trim() ||
      fileName.replace(/\.[^./\\]+$/, '').trim() ||
      fileName.trim()
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
      recordId: presignedResponse.recordId,
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
      console.log('Save successful, recordId:', result.recordId)

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
    const statusResponse = await getUploadStatus(presignedData.recordId)
    console.log('Upload status response:', statusResponse)
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
        setPeringkatKeselamatan(data)
      } catch (error) {
        console.error('Error fetching access levels:', error)
        setPeringkatKeselamatan([])
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
          console.log('Record information:', fullRecordInformationData)

          // Set Lokasi Folder using record information
          if (fullRecordInformationData?.folderId && fullRecordInformationData?.file?.path) {
            const formattedPath = convertPathFormat(fullRecordInformationData.file.path)
            setFolderSelection({
              id: fullRecordInformationData.folderId,
              path: formattedPath,
            })
          }
        }
      } catch (err) {
        console.error('Error fetching record information:', err)
      }
    }

    fetchAccessLevels()
    fetchDropdownDataUnit()
    fetchRecordInformation()
  }, [MuatNaikDokumenID])


  useEffect(() => {
    const fetchDropdownDataDocument = async () => {
      if (!selectedUnitsFromDropdown) {
        setDropdownJenisDokumen([])
        setSelectedProfile('')
        setSelectedProfileId('')
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const acceptedFileTypes = '.docx,.pdf'

  const handleUnitChange = (unitCode: string) => {
    setSelectedUnitsFromDropdown(unitCode)
    setSelectedProfile('')
    setSelectedProfileId('')
    setTitleFallbackNotice(null)
  }

  const handleProfileChange = (profileCodeName: string) => {
    setSelectedProfile(profileCodeName)
    setTitleFallbackNotice(null)
    const matchedProfile = dropdownJenisDokumen.find((item) => item.codeName === profileCodeName)
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
              peringkatKeselamatan={peringkatKeselamatan}
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
