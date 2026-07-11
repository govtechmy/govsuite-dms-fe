import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import type { ProgressState } from '@/components/shared/ProgressResult'
import ProgressResultChecker from '@/components/shared/ProgressResult'
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
import { getProfileDocumentConfig, type MetadataField } from '@/services/upload.svc'

export default function MuatNaikDokumenPage() {
  const [progress, setProgress] = useState<ProgressState>(null)
  const [selectedProfile, setSelectedProfile] = useState<string>('')
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [allInfoDocs, setAllInfoDocs] = useState<DocPreviewInfo | null>(null)
  const [peringkatKeselamatan, setPeringkatKeselamatan] = useState<AccessLevel[]>([])
  const [dropdownUnits, setDropdownUnits] = useState<DropdownUnit[]>([])
  const [dropdownJenisDokumen, setDropdownJenisDokumen] = useState<DropdownJenisDokumen[]>([])
  const [selectedUnitsFromDropdown, setSelectedUnitsFromDropdown] = useState<string | undefined>()
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>([])

  //later post properly
  const handleSubmitDokumen = () => {
    setProgress('loading')

    window.setTimeout(() => {
      setProgress('success')
    }, 2000)
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
    } else {
      setSelectedProfileId('')
    }
  }

  return (
    <>
      {progress !== null && (
        <div className="flex h-full justify-center items-center">
          <ProgressResultChecker
            progress={progress}
            loadingDescription="Dokumen Sedang Diproses"
            errorTitle="Gagal Diluluskan!"
            errorDescription="Dokumen gagal diluluskan, sila cuba lagi atau hubungi pentadbir sistem"
            errorButtonText="Kembali Ke Laman Utama"
            errorUploadingTitle={'Dokumen Gagal Diupload'}
            errorUploadingDescription={'Dokumen Gagal Diupload, semak dengan admin anda!'}
            errorUploadingButtonText={'Kembali Ke Laman Utama'}
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
