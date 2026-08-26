import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import MainHeading from '@/components/layout/MainHeading'
import { ArrowBackIcon, ReloadIcon, TrashIcon } from '@govtechmy/myds-react/icon'
import { Button } from '@govtechmy/myds-react/button'
import SelectDropdownUnit from '@/components/page/MuatNaik/SelectDropdownUnit'
import DropdownWithSearch from '@/components/shared/DropdownWithSearch'
import {
  getDropdownUnits,
  getProfileDocumentsByUnit,
  getAccessLevels,
  getRetentionPeriods,
  type DropdownUnit,
  type ProfileDocument,
  type AccessLevel,
  type RetentionPeriod,
} from '@/services/dropdown.svc'
import { Input } from '@govtechmy/myds-react/input'
import { Checkbox } from '@govtechmy/myds-react/checkbox'
import { clx } from '@govtechmy/myds-react/utils'
import { Spinner } from '@govtechmy/myds-react/spinner'
import { Callout, CalloutContent, CalloutTitle } from '@govtechmy/myds-react/callout'
import TetapanActionModal, {
  type TetapanActionType,
} from '@/components/page/Pengurusan/TetapanActionModal'
import SelectDropdownTahapAksesLalai from '@/components/page/Pengurusan/PengurusanDokumen/SelectDropdownTahapAksesLalai'
import SelectDropdownTempohSimpanan from '@/components/page/Pengurusan/PengurusanDokumen/SelectDropdownTempohSimpanan'
import {
  getPengurusanDokumenConfig,
  type PengurusanDokumenConfig,
} from '@/services/pengurusanDokumen.svc'
import extractBackendError from '@/utils/extractBackendError'

interface ChecklistItem {
  key: string
  title?: string
  value: boolean
  isFixed: boolean
  required?: boolean
}

const INITIAL_MEDAN_WAJIB: ChecklistItem[] = [
  { key: 'TAJUK', title: 'Tajuk', value: true, isFixed: true, required: true },
  { key: 'Klasifikasi File', title: 'Klasifikasi', value: true, isFixed: false, required: true },
  {
    key: 'Tarikh Mesyuarat',
    title: 'Tarikh Mesyuarat',
    value: false,
    isFixed: false,
    required: true,
  },
  { key: 'Nama Pewujud', title: 'Nama Pewujud', value: false, isFixed: false, required: true },
  {
    key: 'Tempat Mesyuarat',
    title: 'Tempat Mesyuarat',
    value: false,
    isFixed: false,
    required: true,
  },
  {
    key: 'Bilangan Helaian',
    title: 'Bilangan Helaian',
    value: false,
    isFixed: false,
    required: true,
  },
  {
    key: 'Jenis Kemasukan Rekod',
    title: 'Jenis Kemasukan Rekod',
    value: false,
    isFixed: false,
    required: true,
  },
]

const INITIAL_VALIDASI_FAIL: ChecklistItem[] = [
  { key: 'pdf', value: true, isFixed: true },
  { key: 'docx', value: true, isFixed: false },
  { key: 'png', value: false, isFixed: false },
  { key: 'jpg', value: false, isFixed: false },
  { key: 'jpeg', value: false, isFixed: false },
  { key: 'rtf', value: false, isFixed: false },
  { key: 'pptx', value: false, isFixed: false },
  { key: 'xlsx', value: false, isFixed: false },
  { key: 'xls', value: false, isFixed: false },
  { key: 'csv', value: false, isFixed: false },
]

export default function PengurusanDokumenIDPage() {
  const { PengurusanDokumenID = 'draf' } = useParams<{ PengurusanDokumenID: string }>()
  const isDraf = PengurusanDokumenID === 'draf'

  const [dropdownUnits, setDropdownUnits] = useState<DropdownUnit[]>([])
  const [dropdownJenisDokumen, setDropdownJenisDokumen] = useState<ProfileDocument[]>([])
  const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([])
  const [retentionPeriods, setRetentionPeriods] = useState<RetentionPeriod[]>([])
  const [selectedUnit, setSelectedUnit] = useState<string | undefined>()
  const [selectedProfile, setSelectedProfile] = useState<string>('')
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<string>('')
  const [selectedRetentionPeriod, setSelectedRetentionPeriod] = useState<string>('')
  const [medanWajib, setMedanWajib] = useState<ChecklistItem[]>(INITIAL_MEDAN_WAJIB)
  const [validasiFail, setValidasiFail] = useState<ChecklistItem[]>(INITIAL_VALIDASI_FAIL)
  const [maxFileSizeMb, setMaxFileSizeMb] = useState<string>('')
  const [activeTetapanAction, setActiveTetapanAction] = useState<TetapanActionType | null>(null)

  const [config, setConfig] = useState<PengurusanDokumenConfig | null>(null)
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [configError, setConfigError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDropdownDataUnit = async () => {
      try {
        const unitsData = await getDropdownUnits()
        setDropdownUnits(unitsData)
      } catch (err) {
        console.error('Error fetching dropdown data:', err)
      }
    }
    fetchDropdownDataUnit()
  }, [])

  useEffect(() => {
    const fetchDropdownDataKlasifikasiAkses = async () => {
      try {
        const [accessLevelsData, retentionPeriodsData] = await Promise.all([
          getAccessLevels(),
          getRetentionPeriods(),
        ])
        setAccessLevels(accessLevelsData)
        setRetentionPeriods(retentionPeriodsData)
      } catch (err) {
        console.error('Error fetching access level / retention period dropdown data:', err)
      }
    }
    fetchDropdownDataKlasifikasiAkses()
  }, [])

  const applyConfigToForm = (data: PengurusanDokumenConfig | null) => {
    setSelectedUnit(data?.unitId || undefined)
    setSelectedProfile(data?.documentProfileName || '')
    setSelectedAccessLevel(data?.defaultAccessLevel.codeName || '')
    setSelectedRetentionPeriod(data?.retentionPeriod.codeName || '')
    setMedanWajib(data?.metadataFields.length ? data.metadataFields : INITIAL_MEDAN_WAJIB)
    setValidasiFail(
      INITIAL_VALIDASI_FAIL.map((item) => ({
        ...item,
        value: data ? data.allowedFormats.includes(item.key) : item.value,
      }))
    )
    setMaxFileSizeMb(data?.maxFileSizeMb ? String(data.maxFileSizeMb) : '')
  }

  useEffect(() => {
    // A brand new "Tambah Tetapan" flow (draf) has no existing config to
    // fetch yet - just start from a blank form using the basic dropdown
    // data fetched elsewhere on this page.
    if (isDraf) {
      setConfig(null)
      setConfigError(null)
      applyConfigToForm(null)
      setIsLoadingConfig(false)
      return
    }

    const fetchConfig = async () => {
      try {
        setIsLoadingConfig(true)
        setConfigError(null)
        const data = await getPengurusanDokumenConfig(PengurusanDokumenID)
        setConfig(data)
        applyConfigToForm(data)
      } catch (err) {
        const backendError = extractBackendError(err)
        setConfigError(backendError?.message ?? 'Gagal memuatkan tetapan ini')
        console.error('Error fetching pengurusan dokumen config:', err)
      } finally {
        setIsLoadingConfig(false)
      }
    }
    fetchConfig()
  }, [PengurusanDokumenID, isDraf])

  useEffect(() => {
    const fetchDropdownDataDocument = async () => {
      if (!selectedUnit) {
        setDropdownJenisDokumen([])
        return
      }

      try {
        const response = await getProfileDocumentsByUnit(selectedUnit)
        setDropdownJenisDokumen(response)
      } catch (err) {
        console.error('Error fetching profile documents:', err)
        setDropdownJenisDokumen([])
      }
    }
    fetchDropdownDataDocument()
  }, [selectedUnit])

  const handleUnitChange = (unitCode: string) => {
    setSelectedUnit(unitCode)
    setSelectedProfile('')
  }

  const handleResetSemula = () => {
    applyConfigToForm(config)
  }

  const toggleMedanWajib = (key: string) => {
    setMedanWajib((prev) =>
      prev.map((item) =>
        item.key === key && !item.isFixed ? { ...item, value: !item.value } : item
      )
    )
  }

  const toggleValidasiFail = (key: string) => {
    setValidasiFail((prev) =>
      prev.map((item) =>
        item.key === key && !item.isFixed ? { ...item, value: !item.value } : item
      )
    )
  }
  const navigate = useNavigate()
  const { lang = 'ms' } = useParams<{ lang: string }>()

  return (
    <RightSidePageLayoutWrapper className="h-full flex flex-col justify-between">
      <TetapanActionModal
        action={activeTetapanAction}
        onClose={() => setActiveTetapanAction(null)}
        onSuccess={() => {
          // Only "Buang" removes the record entirely, so only that action
          // needs to navigate back to the settings list.
          navigate(`/${lang}/pengurusan-dokumen`)
        }}
      />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <button
                type="button"
                aria-label="Kembali ke halaman utama"
                className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-primary"
              >
                <ArrowBackIcon onClick={() => navigate(`/${lang}/pengurusan-dokumen`)} />
              </button>
              <MainHeading>{isDraf ? 'Tambah Tetapan' : 'Kemaskini Tetapan'}</MainHeading>
            </div>
            <Button
              variant="default-outline"
              onClick={handleResetSemula}
              disabled={isLoadingConfig}
            >
              <ReloadIcon className="size-4" />
              <div>Set Semula</div>
            </Button>
          </div>
        </div>
        {isLoadingConfig && (
          <div className="flex items-center justify-center py-12">
            <Spinner size="large" />
          </div>
        )}
        {!isLoadingConfig && configError && (
          <Callout variant="danger">
            <CalloutTitle>Ralat</CalloutTitle>
            <CalloutContent>{configError}</CalloutContent>
          </Callout>
        )}
        {!isLoadingConfig && !configError && (
          <>
            <div className="flex flex-col gap-3">
              <div className="text-body-md font-semibold font-body text-txt-black-900">
                Tetapan Asas
              </div>
              <div className="flex flex-row gap-4 w-full">
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="flex text-body-md font-medium font-body text-txt-black-700">
                    Unit <div className="text-txt-danger">*</div>
                  </div>
                  <div className="max-w-[450px]">
                    <SelectDropdownUnit
                      dropdownUnits={dropdownUnits}
                      selectedUnit={selectedUnit}
                      onUnitChange={handleUnitChange}
                    />
                  </div>
                </div>
                {selectedUnit && (
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex text-body-md font-medium font-body text-txt-black-700">
                      Profil Dokumen <div className="text-txt-danger">*</div>
                    </div>
                    <DropdownWithSearch
                      options={dropdownJenisDokumen.map((item) => item.documentProfile)}
                      value={selectedProfile}
                      onValueChange={setSelectedProfile}
                      className="w-full font-normal"
                    />
                  </div>
                )}
              </div>
            </div>
            {selectedProfile && (
              <>
                <div className="flex flex-col gap-3">
                  <div className="text-body-md font-semibold font-body text-txt-black-900">
                    Klasifikasi & Akses
                  </div>
                  <div className="flex flex-row gap-4 w-full">
                    <div className="flex flex-1 flex-col gap-1.5">
                      <div className="flex text-body-md font-medium font-body text-txt-black-700">
                        Tahap Akses Lalai <div className="text-txt-danger">*</div>
                      </div>
                      <div className="max-w-[450px]">
                        <SelectDropdownTahapAksesLalai
                          accessLevels={accessLevels}
                          selectedAccessLevel={selectedAccessLevel}
                          setSelectedAccessLevel={setSelectedAccessLevel}
                        />
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-1.5">
                      <div className="flex text-body-md font-medium font-body text-txt-black-700">
                        Tempoh Simpanan <p className="italic pl-2"> (Retention)</p>
                        <div className="text-txt-danger">*</div>
                      </div>
                      <SelectDropdownTempohSimpanan
                        retentionPeriods={retentionPeriods}
                        selectedRetentionPeriod={selectedRetentionPeriod}
                        setSelectedRetentionPeriod={setSelectedRetentionPeriod}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="text-body-md font-semibold font-body text-txt-black-900">
                    Medan Wajib
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
                    {medanWajib.map((item) => (
                      <div
                        key={item.key}
                        onClick={() => toggleMedanWajib(item.key)}
                        className={clx(
                          'flex items-center gap-2',
                          item.isFixed ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                        )}
                      >
                        <Checkbox
                          checked={item.value}
                          disabled={item.isFixed}
                          aria-label={item.title ?? item.key}
                        />
                        <span className="text-body-sm font-medium text-txt-black-700">
                          {item.title ?? item.key}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-3">
                    <div className="text-body-md font-semibold font-body text-txt-black-900">
                      Validasi Fail
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex text-body-md font-medium font-body text-txt-black-700">
                        Format Dibenarkan
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
                        {validasiFail.map((item) => (
                          <div
                            key={item.key}
                            onClick={() => toggleValidasiFail(item.key)}
                            className={clx(
                              'flex items-center gap-2',
                              item.isFixed ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                            )}
                          >
                            <Checkbox
                              checked={item.value}
                              disabled={item.isFixed}
                              aria-label={item.key}
                            />
                            <span className="text-body-sm font-medium text-txt-black-700 uppercase">
                              {item.key}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex text-body-md font-medium font-body text-txt-black-700">
                      Saiz Maksimum (MB)
                    </div>
                    <Input
                      size="medium"
                      type="number"
                      min={0}
                      placeholder="0MB"
                      value={maxFileSizeMb}
                      onChange={(event) => setMaxFileSizeMb(event.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
      {!isLoadingConfig && !configError && (isDraf || selectedProfile) && (
        <div className={clx('w-fulll flex', isDraf ? 'justify-end' : 'justify-between')}>
          {!isDraf && (
            <Button variant={'danger-outline'} onClick={() => setActiveTetapanAction('buang')}>
              <TrashIcon /> Buang Tetapan
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant={'primary-outline'} onClick={() => setActiveTetapanAction('nyahaktif')}>
              Nyahaktif Tetapan
            </Button>
            {isDraf ? (
              <Button onClick={() => setActiveTetapanAction('simpan')}>Simpan Tetapan</Button>
            ) : (
              <Button onClick={() => setActiveTetapanAction('kemaskini')}>Kemaskini Tetapan</Button>
            )}
          </div>
        </div>
      )}
    </RightSidePageLayoutWrapper>
  )
}
