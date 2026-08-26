import { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@govtechmy/myds-react/accordion'
import { AnnounceBarTag } from '@govtechmy/myds-react/announce-bar'
import { Callout, CalloutContent, CalloutTitle } from '@govtechmy/myds-react/callout'
import { Spinner } from '@govtechmy/myds-react/spinner'
import folderOpen from '@/assets/png/Folder_open.png'
import folderClose from '@/assets/png/Folder_close.png'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getPengurusanTetapanByUnit,
  type PengurusanTetapanItem,
  type PengurusanUnitSummary,
} from '@/services/pengurusanDokumen.svc'
import { formatISODateString } from '@/utils/formatDate'
import extractBackendError from '@/utils/extractBackendError'

interface UnitTetapanState {
  items: PengurusanTetapanItem[]
  isLoading: boolean
  error: string | null
}

const EMPTY_TETAPAN_STATE: UnitTetapanState = {
  items: [],
  isLoading: false,
  error: null,
}

interface KatalogUnitProps {
  units: PengurusanUnitSummary[]
}

export default function KatalogUnit({ units }: KatalogUnitProps) {
  const [openUnits, setOpenUnits] = useState<string[]>([])
  const [unitTetapan, setUnitTetapan] = useState<Record<string, UnitTetapanState>>({})
  const navigate = useNavigate()
  const { lang = 'ms' } = useParams<{ lang: string }>()

  const updateUnitTetapan = (unitKey: string, updates: Partial<UnitTetapanState>) => {
    setUnitTetapan((prev) => ({
      ...prev,
      [unitKey]: {
        ...(prev[unitKey] ?? EMPTY_TETAPAN_STATE),
        ...updates,
      },
    }))
  }

  const fetchUnitTetapan = async (unitKey: string) => {
    updateUnitTetapan(unitKey, { isLoading: true, error: null })

    try {
      const items = await getPengurusanTetapanByUnit(unitKey)
      updateUnitTetapan(unitKey, { items, isLoading: false, error: null })
    } catch (error) {
      const backendError = extractBackendError(error)
      const message = backendError?.message ?? 'Gagal memuatkan tetapan unit ini'
      updateUnitTetapan(unitKey, { isLoading: false, error: message })
    }
  }

  const handleAccordionChange = (values: string[]) => {
    const newlyOpened = values.filter((value) => !openUnits.includes(value))
    setOpenUnits(values)

    // Fetch once per unit and cache the result; re-opening an already
    // loaded unit reuses the cached items instead of re-fetching.
    newlyOpened.forEach((unitKey) => {
      const hasLoadedBefore = unitTetapan[unitKey] !== undefined
      if (!hasLoadedBefore) {
        void fetchUnitTetapan(unitKey)
      }
    })
  }

  return (
    <Accordion
      type="multiple"
      value={openUnits}
      onValueChange={handleAccordionChange}
      className="space-y-7"
    >
      {units.map((unit) => {
        const isOpen = openUnits.includes(unit.key)
        const tetapanState = unitTetapan[unit.key] ?? EMPTY_TETAPAN_STATE

        return (
          <AccordionItem key={unit.key} value={unit.key} className="border-none !mt-7">
            <AccordionTrigger className="py-0 hover:no-underline">
              <div className="flex w-full min-w-0 items-center gap-3 text-left">
                <img
                  src={isOpen ? folderOpen : folderClose}
                  alt="Folder"
                  className="h-8 w-8 shrink-0 object-contain transition-all duration-200"
                />

                <div className="flex min-w-0 items-center gap-3">
                  <h2 className="min-w-0 truncate text-body-lg font-semibold font-body text-txt-black-900">
                    {unit.value}
                  </h2>

                  {unit.count > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-[20px] bg-primary-600 font-body px-1 text-body-sm font-medium text-white">
                      {unit.count}
                    </span>
                  )}
                </div>

                <div className="flex-1 border-t border-dashed border-otl-gray-200" />
              </div>
            </AccordionTrigger>

            <AccordionContent className="pb-0 pt-6 pr-0">
              {tetapanState.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="large" />
                </div>
              ) : tetapanState.error ? (
                <Callout variant="danger">
                  <CalloutTitle>Ralat</CalloutTitle>
                  <CalloutContent>{tetapanState.error}</CalloutContent>
                </Callout>
              ) : tetapanState.items.length === 0 ? (
                <p className="py-5 text-center text-body-sm font-medium text-txt-black-500">
                  Tiada tetapan ditemui bagi unit ini
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {tetapanState.items.map((item) => (
                    <div
                      key={item.documentProfileId}
                      className="rounded-xl border border-otl-gray-200 bg-bg-dialog p-4 shadow-sm cursor-pointer"
                      onClick={() =>
                        navigate(`/${lang}/pengurusan-dokumen/${item.documentProfileId}`)
                      }
                    >
                      <h3 className="text-body-md font-medium text-txt-black-900">
                        {item.documentProfileName}
                      </h3>
                      <p className="mt-1 text-body-sm text-txt-black-500">
                        Kemaskini terakhir {formatISODateString(item.updatedAt)}
                      </p>
                      <div className="mt-4">
                        <AnnounceBarTag variant={item.isActive ? 'success' : 'default'}>
                          ● {item.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </AnnounceBarTag>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
