// export default function PengurusanPage() {
//   return <div>This is Pengurusan Page</div>
// }

import { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@govtechmy/myds-react/accordion'
import { AnnounceBarTag } from '@govtechmy/myds-react/announce-bar'
import { Button } from '@govtechmy/myds-react/button'

import folderOpen from '../assets/Icons/Folder_open.png'
import folderClose from '../assets/Icons/Folder_close.png'

const units = [
  {
    name: 'Unit L',
    items: [
      ['Akta / Ordinan', true],
      ['Carta', true],
      ['Dokumen Tender / Sebut Harga', true],
      ['E-mel', true],
      ['E-mel Muat Naik', false],
    ],
  },
  { name: 'Unit UP', items: [] },
  {
    name: 'Unit K',
    items: [
      ['Akta / Ordinan', true],
      ['Carta', true],
      ['Dokumen Tender / Sebut Harga', true],
      ['E-mel', true],
      ['E-mel Muat Naik', false],
    ],
  },
  {
    name: 'Unit H',
    items: [
      ['Akta / Ordinan', true],
      ['Carta', true],
    ],
  },
  {
    name: 'Unit M',
    items: [
      ['Akta / Ordinan', true],
      ['Carta', true],
    ],
  },
  {
    name: 'Unit J',
    items: [
      ['Akta / Ordinan', true],
      ['Carta', true],
      ['Dokumen Tender / Sebut Harga', true],
      ['E-mel', true],
      ['E-mel Muat Naik', false],
    ],
  },
  {
    name: 'Unit IO',
    items: [
      ['Akta / Ordinan', true],
      ['Carta', true],
      ['Dokumen Tender / Sebut Harga', true],
      ['E-mel', true],
      ['E-mel Muat Naik', false],
    ],
  },
]

export default function PengurusanDokumenPage() {
  const [openUnits, setOpenUnits] = useState<string[]>(['Unit L', 'Unit UP', 'Unit K'])

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-['Poppins'] text-heading-2xs font-semibold text-txt-black-900">
          Pengurusan Dokumen
        </h1>

        <Button
          type="button"
          variant="primary-fill"
          className="h-8 rounded-[8px] text-body-sm font-medium"
        >
          + Tambah Tetapan
        </Button>
      </div>

      <Accordion
        type="multiple"
        value={openUnits}
        onValueChange={setOpenUnits}
        className="space-y-7"
      >
        {units.map((unit) => {
          const isOpen = openUnits.includes(unit.name)

          return (
            <AccordionItem key={unit.name} value={unit.name} className="border-none">
              <AccordionTrigger className="py-0 hover:no-underline">
                <div className="flex w-full items-center gap-3 text-left">
                  <FolderIcon isOpen={isOpen} />

                  <div className="flex items-center gap-2">
                    <h2 className="whitespace-nowrap text-body-lg font-semibold text-txt-black-900">
                      {unit.name}
                    </h2>

                    {unit.items.length > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-[20px] bg-primary-600 px-1 text-body-sm font-medium text-white">
                        {unit.items.length}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 border-t border-dashed border-outline-grey" />
                </div>
              </AccordionTrigger>

              <AccordionContent className="pt-5">
                {unit.items.length === 0 ? (
                  <p className="py-5 text-center text-body-sm font-medium text-txt-black-500">
                    Tiada tetapan ditemui bagi unit ini
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {unit.items.map(([title, active]) => (
                      <div
                        key={unit.name + '-' + title}
                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
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
    </div>
  )
}

function FolderIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <img
      src={isOpen ? folderOpen : folderClose}
      alt="Folder"
      className="h-8 w-8 shrink-0 object-contain transition-all duration-200"
    />
  )
}
