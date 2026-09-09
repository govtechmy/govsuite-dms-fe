import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import { useNavigate, useParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import MainHeading from '@/components/layout/MainHeading'
import { ArrowBackIcon, ReloadIcon, TrashIcon } from '@govtechmy/myds-react/icon'
import { Button } from '@govtechmy/myds-react/button'
import SelectDropdownUnit from '@/components/page/MuatNaik/SelectDropdownUnit'
import DropdownWithSearch from '@/components/shared/DropdownWithSearch'
import {
  getDropdownUnits,
  getDropdownJenisDokumen,
  getAccessLevels,
  getRetentionPeriods,
  type DropdownUnit,
  type DropdownJenisDokumen,
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
} from '@/components/page/Pengurusan/PengurusanDokumen/TetapanActionModal'
import SelectDropdownTahapAksesLalai from '@/components/page/Pengurusan/PengurusanDokumen/SelectDropdownTahapAksesLalai'
import SelectDropdownTempohSimpanan from '@/components/page/Pengurusan/PengurusanDokumen/SelectDropdownTempohSimpanan'
import {
  getPengurusanDokumenConfig,
  getPengurusanDokumenDefaultConfig,
  getPengurusanTetapanByUnit,
  createPengurusanDokumenConfig,
  updatePengurusanDokumenConfig,
  deactivatePengurusanDokumenConfig,
  activatePengurusanDokumenConfig,
  deletePengurusanDokumenConfig,
  type PengurusanDokumenConfig,
  type PengurusanDokumenMetadataField,
  type PengurusanDokumenFormatField,
  type PengurusanTetapanItem,
} from '@/services/pengurusanDokumen.svc'
import extractBackendError from '@/utils/extractBackendError'

export default function PengurusanDokumenIDPage() {
  const { PengurusanDokumenID = 'draf' } = useParams<{ PengurusanDokumenID: string }>()
  const isDraf = PengurusanDokumenID === 'draf'

  const [dropdownUnits, setDropdownUnits] = useState<DropdownUnit[]>([])
  // Tambah flow: global document profile catalog (not unit-scoped).
  const [dropdownProfilLookup, setDropdownProfilLookup] = useState<DropdownJenisDokumen[]>([])
  // Kemaskini flow: existing tetapan records scoped to the selected unit,
  // used to resolve the record currently being edited.
  const [dropdownTetapanByUnit, setDropdownTetapanByUnit] = useState<PengurusanTetapanItem[]>([])
  const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([])
  const [retentionPeriods, setRetentionPeriods] = useState<RetentionPeriod[]>([])
  const [selectedUnit, setSelectedUnit] = useState<string | undefined>()
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<string>('')
  const [selectedRetentionPeriod, setSelectedRetentionPeriod] = useState<string>('')
  const [medanWajib, setMedanWajib] = useState<PengurusanDokumenMetadataField[]>([])
  const [validasiFail, setValidasiFail] = useState<PengurusanDokumenFormatField[]>([])
  const [maxFileSizeMb, setMaxFileSizeMb] = useState<string>('')
  const [activeTetapanAction, setActiveTetapanAction] = useState<TetapanActionType | null>(null)

  const [config, setConfig] = useState<PengurusanDokumenConfig | null>(null)
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [configError, setConfigError] = useState<string | null>(null)
  // Separate loading/error state for the Tambah flow's profile-triggered
  // defaults fetch, so it only affects the settings sub-section below
  // instead of hiding the whole page (including the Unit/Profil Dokumen
  // dropdowns the user just interacted with).
  const [isLoadingProfileDefaults, setIsLoadingProfileDefaults] = useState(false)
  const [profileDefaultsError, setProfileDefaultsError] = useState<string | null>(null)

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

  useEffect(() => {
    // Tambah's Profil Dokumen dropdown is the global catalog, unrelated to
    // the selected unit - fetch it once, only when it's actually needed.
    if (!isDraf) return

    const fetchDropdownProfilLookup = async () => {
      try {
        const data = await getDropdownJenisDokumen()
        setDropdownProfilLookup(data)
      } catch (err) {
        console.error('Error fetching document profile lookup:', err)
      }
    }
    fetchDropdownProfilLookup()
  }, [isDraf])

  // `includeIdentity` also applies the Unit/Profil Dokumen fields - used when
  // loading an existing record (Kemaskini), but skipped when prefilling
  // defaults after picking a profile in the Tambah flow, since the user has
  // already made that choice.
  const applyConfigToForm = useCallback(
    (data: PengurusanDokumenConfig | null, includeIdentity: boolean) => {
      if (includeIdentity) {
        setSelectedUnit(data?.unitId || undefined)
        // The GET response doesn't echo back the record's own id - it's
        // already known, since it's what we fetched by (the route param).
        setSelectedProfileId(data ? PengurusanDokumenID : '')
      }
      setSelectedAccessLevel(data?.defaultAccessLevel.code || '')
      setSelectedRetentionPeriod(data?.retentionPeriod.code || '')
      setMedanWajib(data?.metadataFields ?? [])
      setValidasiFail(data?.allowedFormats ?? [])
      setMaxFileSizeMb(data?.maxFileSizeMb ? String(data.maxFileSizeMb) : '')
    },
    [PengurusanDokumenID]
  )

  useEffect(() => {
    // A brand new "Tambah Tetapan" flow (draf) has no existing record to
    // load by id - its defaults are instead fetched once a Profil Dokumen
    // is picked (see the effect below). It also doesn't use the full-page
    // loading gate below, since there's nothing to load yet on mount.
    if (isDraf) {
      setIsLoadingConfig(false)
      return
    }

    const fetchConfig = async () => {
      try {
        setIsLoadingConfig(true)
        setConfigError(null)
        const data = await getPengurusanDokumenConfig(PengurusanDokumenID)
        setConfig(data)
        applyConfigToForm(data, true)
      } catch (err) {
        const backendError = extractBackendError(err)
        setConfigError(backendError?.message ?? 'Gagal memuatkan tetapan ini')
        console.error('Error fetching pengurusan dokumen config:', err)
      } finally {
        setIsLoadingConfig(false)
      }
    }
    fetchConfig()
  }, [PengurusanDokumenID, isDraf, applyConfigToForm])

  useEffect(() => {
    // Kemaskini only - resolves the existing record being edited. Tambah
    // uses the global lookup catalog above instead.
    if (isDraf) return

    const fetchDropdownDataDocument = async () => {
      if (!selectedUnit) {
        setDropdownTetapanByUnit([])
        return
      }

      try {
        const response = await getPengurusanTetapanByUnit(selectedUnit)
        setDropdownTetapanByUnit(response)
      } catch (err) {
        console.error('Error fetching profile documents:', err)
        setDropdownTetapanByUnit([])
      }
    }
    fetchDropdownDataDocument()
  }, [isDraf, selectedUnit])

  // Resolves the profile-document record (code, name, ...) for whichever id
  // is currently selected in the Profil Dokumen dropdown. Only needed for
  // Kemaskini - Tambah uses `selectedProfileId` (the profile code) directly.
  const selectedProfileDocument = useMemo(
    () => dropdownTetapanByUnit.find((item) => item.documentProfileId === selectedProfileId),
    [dropdownTetapanByUnit, selectedProfileId]
  )

  const hasSelectedProfile = isDraf ? Boolean(selectedProfileId) : Boolean(selectedProfileDocument)

  useEffect(() => {
    // Only the Tambah flow prefills defaults from the selected profile's
    // base config - Kemaskini already loaded its record by id above.
    // `selectedProfileId` here is the profile's code (from the /lookup/profile
    // catalog), which is also the key the default-config endpoint expects.
    if (!isDraf) return

    if (!selectedProfileId) {
      setConfig(null)
      setProfileDefaultsError(null)
      applyConfigToForm(null, false)
      setIsLoadingProfileDefaults(false)
      return
    }

    const fetchDefaultConfig = async () => {
      try {
        setIsLoadingProfileDefaults(true)
        setProfileDefaultsError(null)
        const data = await getPengurusanDokumenDefaultConfig(selectedProfileId)
        setConfig(data)
        applyConfigToForm(data, false)
      } catch (err) {
        const backendError = extractBackendError(err)
        setProfileDefaultsError(backendError?.message ?? 'Gagal memuatkan tetapan lalai profil ini')
        console.error('Error fetching default config for selected profile:', err)
      } finally {
        setIsLoadingProfileDefaults(false)
      }
    }
    fetchDefaultConfig()
  }, [isDraf, selectedProfileId, applyConfigToForm])

  const handleUnitChange = (unitCode: string) => {
    setSelectedUnit(unitCode)
    setSelectedProfileId('')
  }

  const handleResetSemula = () => {
    applyConfigToForm(config, !isDraf)
  }

  const handleSimpanConfirm = async () => {
    if (!config || !selectedUnit) {
      throw new Error('Sila lengkapkan semua medan wajib sebelum menyimpan.')
    }
    await createPengurusanDokumenConfig({
      workflowCode: config.workflowCode,
      documentProfileCode: config.documentProfileCode,
      documentProfileName: config.documentProfileName,
      defaultAccessLevel: selectedAccessLevel,
      retentionPeriod: selectedRetentionPeriod,
      allowedFormats: validasiFail,
      maxFileSizeMb: Number(maxFileSizeMb) || 0,
      metadataFields: medanWajib,
      unitId: selectedUnit,
    })
  }

  const handleKemaskiniConfirm = async () => {
    if (!config) {
      throw new Error('Sila lengkapkan semua medan wajib sebelum mengemaskini.')
    }
    await updatePengurusanDokumenConfig(PengurusanDokumenID, {
      workflowCode: config.workflowCode,
      documentProfileCode: config.documentProfileCode,
      documentProfileName: config.documentProfileName,
      defaultAccessLevel: selectedAccessLevel,
      retentionPeriod: selectedRetentionPeriod,
      allowedFormats: validasiFail,
      maxFileSizeMb: Number(maxFileSizeMb) || 0,
      metadataFields: medanWajib,
    })
  }

  const handleNyahaktifConfirm = async () => {
    await deactivatePengurusanDokumenConfig(PengurusanDokumenID)
    setConfig((prev) => (prev ? { ...prev, configStatus: 'TIDAK_AKTIF' } : prev))
  }

  const handleAktifkanConfirm = async () => {
    await activatePengurusanDokumenConfig(PengurusanDokumenID)
    setConfig((prev) => (prev ? { ...prev, configStatus: 'AKTIF' } : prev))
  }

  const handleBuangConfirm = async () => {
    await deletePengurusanDokumenConfig(PengurusanDokumenID)
  }

  const isFormComplete = Boolean(
    selectedUnit &&
    hasSelectedProfile &&
    selectedAccessLevel &&
    selectedRetentionPeriod &&
    validasiFail.some((item) => item.value) &&
    Number(maxFileSizeMb) > 0
  )

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
        onConfirm={
          activeTetapanAction === 'simpan'
            ? handleSimpanConfirm
            : activeTetapanAction === 'kemaskini'
              ? handleKemaskiniConfirm
              : activeTetapanAction === 'nyahaktif'
                ? handleNyahaktifConfirm
                : activeTetapanAction === 'aktifkan'
                  ? handleAktifkanConfirm
                  : handleBuangConfirm
        }
        onSuccess={() => {
          // Every action currently returns to the settings list on success -
          // "Buang" because the record is gone, "Simpan"/"Kemaskini" because
          // there's nothing left to edit on this page after a successful save.
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
              disabled={isLoadingConfig || isLoadingProfileDefaults}
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
                      disabled={!isDraf}
                    />
                  </div>
                </div>
                {selectedUnit && (
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex text-body-md font-medium font-body text-txt-black-700">
                      Profil Dokumen <div className="text-txt-danger">*</div>
                    </div>
                    <DropdownWithSearch
                      options={
                        isDraf
                          ? dropdownProfilLookup.map((item) => ({
                              value: item.code,
                              label: item.codeName,
                            }))
                          : dropdownTetapanByUnit.map((item) => ({
                              value: item.documentProfileId,
                              label: item.documentProfileName,
                            }))
                      }
                      value={selectedProfileId}
                      onValueChange={setSelectedProfileId}
                      className="w-full font-normal"
                      disabled={!isDraf}
                    />
                  </div>
                )}
              </div>
            </div>
            {selectedProfileId && isDraf && isLoadingProfileDefaults && (
              <div className="flex items-center justify-center py-12">
                <Spinner size="large" />
              </div>
            )}
            {selectedProfileId && isDraf && !isLoadingProfileDefaults && profileDefaultsError && (
              <Callout variant="danger">
                <CalloutTitle>Ralat</CalloutTitle>
                <CalloutContent>{profileDefaultsError}</CalloutContent>
              </Callout>
            )}
            {selectedProfileId &&
              (!isDraf || (!isLoadingProfileDefaults && !profileDefaultsError)) && (
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
                    <div className="flex flex-col gap-1.5 mb-6">
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
      {!isLoadingConfig && !configError && (isDraf || selectedProfileId) && (
        <div className={clx('w-full flex', isDraf ? 'justify-end' : 'justify-between')}>
          {!isDraf && (
            <Button variant={'danger-outline'} onClick={() => setActiveTetapanAction('buang')}>
              <TrashIcon /> Buang Tetapan
            </Button>
          )}
          <div className="flex gap-2">
            {!isDraf && config?.configStatus === 'TIDAK_AKTIF' && (
              <Button
                variant={'primary-outline'}
                onClick={() => setActiveTetapanAction('aktifkan')}
              >
                Aktifkan Tetapan
              </Button>
            )}
            {!isDraf && config?.configStatus !== 'TIDAK_AKTIF' && (
              <Button
                variant={'primary-outline'}
                onClick={() => setActiveTetapanAction('nyahaktif')}
              >
                Nyahaktif Tetapan
              </Button>
            )}
            {isDraf ? (
              <Button disabled={!isFormComplete} onClick={() => setActiveTetapanAction('simpan')}>
                Simpan Tetapan
              </Button>
            ) : (
              <Button
                disabled={!isFormComplete}
                onClick={() => setActiveTetapanAction('kemaskini')}
              >
                Kemaskini Tetapan
              </Button>
            )}
          </div>
        </div>
      )}
    </RightSidePageLayoutWrapper>
  )
}
