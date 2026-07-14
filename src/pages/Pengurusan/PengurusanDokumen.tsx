import { Button } from '@govtechmy/myds-react/button'

import HeaderDocuments from '@/components/shared/HeaderDocuments'
import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import type { Unit } from '@/components/shared/KatalogUnit'
import KatalogUnit from '@/components/shared/KatalogUnit'

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
      <HeaderDocuments
        title={'Pengurusan Dokumen'}
        buttonChildren={
          <Button type="button" variant="primary-fill">
            + Tambah Tetapan
          </Button>
        }
      />
      <KatalogUnit units={units} />
    </RightSidePageLayoutWrapper>
  )
}
