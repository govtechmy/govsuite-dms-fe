import { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@govtechmy/myds-react/accordion'
import { AnnounceBarTag } from '@govtechmy/myds-react/announce-bar'
import folderOpen from '@/assets/Icons/Folder_open.png'
import folderClose from '@/assets/Icons/Folder_close.png'

type KatalogUnitItem = [string, boolean]

export interface Unit {
  name: string
  items: KatalogUnitItem[]
}

interface KatalogUnitProps {
  units: Unit[]
}

export default function KatalogUnit({ units }: KatalogUnitProps) {
  const [openUnits, setOpenUnits] = useState<string[]>([])

  return (
    <Accordion type="multiple" value={openUnits} onValueChange={setOpenUnits} className="space-y-7">
      {units.map((unit) => {
        const isOpen = openUnits.includes(unit.name)

        return (
          <AccordionItem key={unit.name} value={unit.name} className="border-none !mt-7">
            <AccordionTrigger className="py-0 hover:no-underline">
              <div className="flex w-full items-center gap-3 text-left">
                <img
                  src={isOpen ? folderOpen : folderClose}
                  alt="Folder"
                  className="h-8 w-8 shrink-0 object-contain transition-all duration-200"
                />

                <div className="flex items-center gap-3">
                  <h2 className="whitespace-nowrap text-body-lg font-semibold font-body text-txt-black-900">
                    {unit.name}
                  </h2>

                  {unit.items.length > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-[20px] bg-primary-600 font-body px-1 text-body-sm font-medium text-white">
                      {unit.items.length}
                    </span>
                  )}
                </div>

                <div className="flex-1 border-t border-dashed border-otl-gray-200" />
              </div>
            </AccordionTrigger>

            <AccordionContent className="pb-0 pt-6 pr-0">
              {unit.items.length === 0 ? (
                <p className="py-5 text-center text-body-sm font-medium text-txt-black-500">
                  Tiada tetapan ditemui bagi unit ini
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {unit.items.map(([title, active]) => (
                    <div
                      key={unit.name + '-' + title}
                      className="rounded-xl border border-otl-gray-200 bg-bg-dialog p-4 shadow-sm"
                    >
                      <h3 className="text-body-md font-medium text-txt-black-900">{title}</h3>
                      <p className="mt-1 text-body-sm text-txt-black-500">
                        Kemaskini terakhir 01/01/2024
                      </p>
                      <div className="mt-4">
                        <AnnounceBarTag variant={active ? 'success' : 'default'}>
                          ● {active ? 'Aktif' : 'Tidak Aktif'}
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
