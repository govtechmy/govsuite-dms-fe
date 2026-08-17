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
  type DropdownUnit,
  type ProfileDocument,
} from '@/services/dropdown.svc'
import { Input } from '@govtechmy/myds-react/input'
import { Checkbox } from '@govtechmy/myds-react/checkbox'
import { clx } from '@govtechmy/myds-react/utils'
import TetapanActionModal, {
  type TetapanActionType,
} from '@/components/page/Pengurusan/TetapanActionModal'

interface ChecklistItem {
  key: string
  value: boolean
  isFixed: boolean
  required?: boolean
}

const INITIAL_MEDAN_WAJIB: ChecklistItem[] = [
  { key: 'Tajuk', value: true, isFixed: true, required: true },
  { key: 'Klasifikasi File', value: true, isFixed: false, required: true },
  { key: 'Tarikh Mesyuarat', value: false, isFixed: false, required: true },
  { key: 'Nama Pewujud', value: false, isFixed: false, required: true },
  { key: 'Tempat Mesyuarat', value: false, isFixed: false, required: true },
  { key: 'Bilangan Helaian', value: false, isFixed: false, required: true },
  { key: 'Jenis Kemasukan Rekod', value: false, isFixed: false, required: true },
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
  const { PengurusanDokumenID } = useParams<{ PengurusanDokumenID: string }>()
  console.log(PengurusanDokumenID)

  const [dropdownUnits, setDropdownUnits] = useState<DropdownUnit[]>([])
  const [dropdownJenisDokumen, setDropdownJenisDokumen] = useState<ProfileDocument[]>([])
  const [selectedUnit, setSelectedUnit] = useState<string | undefined>()
  const [selectedProfile, setSelectedProfile] = useState<string>('')
  const [medanWajib, setMedanWajib] = useState<ChecklistItem[]>(INITIAL_MEDAN_WAJIB)
  const [validasiFail, setValidasiFail] = useState<ChecklistItem[]>(INITIAL_VALIDASI_FAIL)
  const [activeTetapanAction, setActiveTetapanAction] = useState<TetapanActionType | null>(null)

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
    setSelectedUnit(undefined)
    setSelectedProfile('')
    setDropdownJenisDokumen([])
    setMedanWajib(INITIAL_MEDAN_WAJIB)
    setValidasiFail(INITIAL_VALIDASI_FAIL)
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
  const draf = false
  const kemaskini = true

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
              <MainHeading>Tambah Tetapan</MainHeading>
            </div>
            <Button variant="default-outline" onClick={handleResetSemula}>
              <ReloadIcon className="size-4" />
              <div>Set Semula</div>
            </Button>
          </div>
        </div>
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
                    <SelectDropdownUnit
                      dropdownUnits={dropdownUnits}
                      selectedUnit={selectedUnit}
                      onUnitChange={handleUnitChange}
                    />
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="flex text-body-md font-medium font-body text-txt-black-700">
                    Tempoh Simpanan <p className="italic pl-2"> (Retention)</p>
                    <div className="text-txt-danger">*</div>
                  </div>
                  <DropdownWithSearch
                    options={dropdownJenisDokumen.map((item) => item.documentProfile)}
                    value={selectedProfile}
                    onValueChange={setSelectedProfile}
                    className="w-full font-normal"
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
                    <Checkbox checked={item.value} disabled={item.isFixed} aria-label={item.key} />
                    <span className="text-body-sm font-medium text-txt-black-700">{item.key}</span>
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
                  Saiz Maksimum
                </div>
                <Input size="medium" placeholder="0MB" />
              </div>
            </div>
          </>
        )}
      </div>
      {draf ||
        (selectedProfile && (
          <div className="w-fulll flex justify-between">
            <Button variant={'danger-outline'} onClick={() => setActiveTetapanAction('buang')}>
              <TrashIcon /> Buang Tetapan
            </Button>
            <div className="flex gap-2">
              <Button
                variant={'primary-outline'}
                onClick={() => setActiveTetapanAction('nyahaktif')}
              >
                Nyahaktif Tetapan
              </Button>
              {draf && (
                <Button onClick={() => setActiveTetapanAction('simpan')}>Simpan Tetapan</Button>
              )}
              {kemaskini && (
                <Button onClick={() => setActiveTetapanAction('kemaskini')}>
                  Kemaskini Tetapan
                </Button>
              )}
            </div>
          </div>
        ))}
    </RightSidePageLayoutWrapper>
  )
}
