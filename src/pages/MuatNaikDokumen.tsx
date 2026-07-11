import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import type { DocPreviewInfo } from '@/components/page/MuatNaik/MuatNaikDokumenForm'
import MuatNaikDokumenForm from '@/components/page/MuatNaik/MuatNaikDokumenForm'
import PratontonRekod from '@/components/page/MuatNaik/PratontonRekod'
import { useState, useEffect } from 'react'
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
  getProfileDocumentConfig,
  requestPresignedUploadUrl,
  uploadFileToPresignedUrl,
  getUploadStatus,
  type MetadataField,
  type PresignUploadResponse,
} from '@/services/upload.svc'
import ProgressResultChecker, { type ProgressState } from '@/components/shared/ProgressResult'
import extractBackendError from '@/utils/extractBackendError'

export default function MuatNaikDokumenPage() {
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
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>([])
  const [presignedResponse, setPresignedResponse] = useState<PresignUploadResponse | null>(null)
  const [uploadPercentage, setUploadPercentage] = useState<number>(0)
  const [submissionProgress, setSubmissionProgress] = useState<ProgressState>(null)
  const [submissionError, setSubmissionError] = useState<{ code: string; message: string } | null>(
    null
  )

  // Handle S3 upload from file selection in Muat Naik card
  const handleUploadToS3 = async (file: File): Promise<void> => {
    if (!selectedProfileDetail?.definitionGroupId) {
      throw new Error('Missing recordConfig (definitionGroupId) from selected profile')
    }

    setUploadPercentage(0)

    // Step 1: Build presign payload
    // RECORD DATE IS NEEDED IN MUAT NAIK BUT USER DOESNT FILL THIS YET, BUT NEED TO UPLOAD!
    const recordDate = new Date().toISOString()
    const fileExtension = file.name.split('.').pop() ?? ''
    const presignPayload = {
      fileName: file.name,
      fileType: file.type,
      fileExtension,
      fileSize: parseFloat((file.size / 1048576).toFixed(1)),
      recordConfig: selectedProfileDetail.definitionGroupId,
      recordDate,
    }

    console.log('Presign payload:', presignPayload)

    // Step 2: Request presigned URL
    const presignedData = await requestPresignedUploadUrl(presignPayload)
    console.log('Presigned response:', presignedData)

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

  // TODO: later post properly - final submission endpoint will go here
  const handleSubmitDokumen = async () => {
    setSubmissionProgress('loading')
    setSubmissionError(null)

    try {
      // TODO: Replace with actual submission endpoint call
      console.log('Submitting document with recordId:', presignedResponse?.recordId)
      console.log('Metadata:', allInfoDocs)

      // Simulate API call (remove when real endpoint is available)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Future: call final metadata submission endpoint
      // const result = await submitDocument({
      //   recordId: presignedResponse?.recordId,
      //   metadata: allInfoDocs,
      //   ...
      // })

      setSubmissionProgress('success')
    } catch (error) {
      console.error('Error submitting document:', error)
      const backendError = extractBackendError(error)
      setSubmissionError({
        code: backendError?.code ?? 'REQUEST_FAILED',
        message:
          backendError?.message ??
          (error instanceof Error ? error.message : 'Permintaan penghantaran gagal diproses.'),
      })
      setSubmissionProgress('error')
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

    fetchAccessLevels()
    fetchDropdownDataUnit()
  }, [])

  useEffect(() => {
    const fetchDropdownDataDocument = async () => {
      if (!selectedUnitsFromDropdown) {
        setDropdownJenisDokumen([])
        setSelectedProfile('')
        setSelectedProfileId('')
        setMetadataFields([])
        return
      }

      try {
        const response = await getProfileDocumentsByUnit(selectedUnitsFromDropdown)
        setDropdownJenisDokumen(response)
        console.log(response)
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
        console.log(unitsData)

        const data = {
          success: true,
          data: {
            definitionGroupId: 'laporan_mesyuarat_unit_up',
            unitId: 'UNIT_UP',
            allowedFormats: ['pdf', 'docx'],
            maxFileSizeMb: 200,
            metadataFields: [
              {
                key: 'title',
                title: 'Tajuk',
                type: 'text',
                required: true,
              },
              {
                key: 'creator',
                title: 'Pewujud',
                type: 'text',
                required: true,
              },
              {
                key: 'tarikh_mesyuarat',
                title: 'Tarikh Mesyuarat',
                type: 'date',
                required: true,
              },
              {
                key: 'jenis_mesyuarat',
                title: 'Jenis Mesyuarat',
                type: 'text',
                required: true,
              },
              {
                key: 'tarikh',
                title: 'Tarikh',
                type: 'date',
                required: false,
              },
            ],
            workflowCode: 'WF_DRAF_SEMAKAN_TIDAK_DILULUSKAN_DITERBITKAN',
            documentProfileCode: 'LAPORAN',
            documentProfileName: 'Laporan Mesyuarat',
            isLatest: true,
            createdAt: '2026-06-25T22:24:59.083Z',
            updatedAt: '2026-07-07T06:58:29.141Z',
          },
        }

        console.log(data.data)

        // Store metadataFields from config (fallback to mock until backend is ready)
        setMetadataFields(data.data.metadataFields || [])
      } catch (err) {
        console.error('Error fetching profile document config:', err)
        setMetadataFields([])
      }
    }
    fetchProfileDocumentConfig()
  }, [selectedProfileId])

  const acceptedFileTypes = '.docx,.pdf'

  const handleUnitChange = (unitCode: string) => {
    setSelectedUnitsFromDropdown(unitCode)
    setSelectedProfile('')
    setSelectedProfileId('')
  }

  const handleProfileChange = (profileCodeName: string) => {
    setSelectedProfile(profileCodeName)
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
        <div className={clx('grid ', selectedProfile && 'grid-cols-2')}>
          <RightSidePageLayoutWrapper
            className={clx('flex flex-col gap-6 w-full ', selectedProfile && 'shadow-card pr-6')}
          >
            <MuatNaikDokumenForm
              dropdownJenisDokumen={dropdownJenisDokumen}
              acceptedFileTypes={acceptedFileTypes}
              peringkatKeselamatan={peringkatKeselamatan}
              selectedProfile={selectedProfile}
              setSelectedProfile={handleProfileChange}
              onPreview={setAllInfoDocs}
              onReset={() => {
                setAllInfoDocs(null)
                setSelectedProfile('')
                setSelectedProfileId('')
                setMetadataFields([])
              }}
              dropdownUnits={dropdownUnits}
              selectedUnit={selectedUnitsFromDropdown}
              onUnitChange={handleUnitChange}
              metadataFields={metadataFields}
              onUploadToS3={handleUploadToS3}
              uploadPercentage={uploadPercentage}
            />
          </RightSidePageLayoutWrapper>
          {selectedProfile && (
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
            onErrorClick={() => setSubmissionProgress(null)}
          />
        </div>
      )}
    </>
  )
}
