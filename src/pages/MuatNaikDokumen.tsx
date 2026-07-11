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
import { getProfileDocumentConfig } from '@/services/upload.svc'

export default function MuatNaikDokumenPage() {
  const [progress, setProgress] = useState<ProgressState>(null)
  const [selectedProfile, setSelectedProfile] = useState<string>('')
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [allInfoDocs, setAllInfoDocs] = useState<DocPreviewInfo | null>(null)
  const [peringkatKeselamatan, setPeringkatKeselamatan] = useState<AccessLevel[]>([])
  const [dropdownUnits, setDropdownUnits] = useState<DropdownUnit[]>([])
  const [dropdownJenisDokumen, setDropdownJenisDokumen] = useState<DropdownJenisDokumen[]>([])
  const [selectedUnitsFromDropdown, setSelectedUnitsFromDropdown] = useState<string | undefined>()

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
      } catch (err) {
        console.error('Error fetching profile document config:', err)
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
              }}
              dropdownUnits={dropdownUnits}
              selectedUnit={selectedUnitsFromDropdown}
              onUnitChange={handleUnitChange}
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
