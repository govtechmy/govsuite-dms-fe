import { Button } from '@govtechmy/myds-react/button'

import HeaderDocuments from '@/components/shared/HeaderDocuments'
import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import type { Unit } from '@/components/shared/KatalogUnit'
import KatalogUnit from '@/components/shared/KatalogUnit'
import { ArrowBackIcon, ReloadIcon } from '@govtechmy/myds-react/icon'
import TetapanAsas from '@/components/page/PengurusanDokumen/TetapanAsas'

const units: Unit[] = [
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
  return (
    <RightSidePageLayoutWrapper>
      <div className="hidden">
        <HeaderDocuments
          title={'Pengurusan Dokumen'}
          buttonChildren={
            <Button type="button" variant="primary-fill">
              + Tambah Tetapan
            </Button>
          }
        />
        <KatalogUnit units={units} />
      </div>
      <div className="flex flex-col gap-6">
        <Button variant="default-ghost" className="items-center justify-center">
          <ArrowBackIcon /> Kembali
        </Button>
        <HeaderDocuments
          title={'Tambah Tetapan'}
          buttonChildren={
            <Button variant="default-outline" className="gap-2">
              <ReloadIcon />
              <div>Set Semula</div>
            </Button>
          }
          className="mb-0"
        />
        <TetapanAsas />
      </div>
    </RightSidePageLayoutWrapper>
  )
}
