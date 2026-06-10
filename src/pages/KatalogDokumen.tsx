import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import KatalogDisplay, { type Unit } from '@/components/page/KatalogDokumen/KatalogDisplay'
import SearchBarKatalogDokumen from '@/components/page/KatalogDokumen/SearchBarKatalogDokumen'
import SelectKatalogDokumen from '@/components/page/KatalogDokumen/SelectKatalogDokumen'

export default function KatalogDokumenPage() {
  const units: Unit[] = [
    {
      name: 'JKPPN',
      items: [
        { name: '2030 - 2034', value: 12 },
        { name: '2025 - 2029', value: 45 },
        { name: '2020 - 2024', value: 89 },
        { name: '2015 - 2019', value: 67 },
        { name: '2010 - 2014', value: 34 },
        { name: '2005 - 2009', value: 23 },
        { name: '1999 - 2004', value: 15 },
      ],
    },
    {
      name: 'JPICT',
      items: [
        { name: '2030 - 2034', value: 8 },
        { name: '2025 - 2029', value: 56 },
        { name: '2020 - 2024', value: 78 },
        { name: '2015 - 2019', value: 43 },
        { name: '2010 - 2014', value: 29 },
        { name: '2005 - 2009', value: 18 },
      ],
    },
    {
      name: 'KSUKP',
      items: [
        { name: '2030 - 2034', value: 15 },
        { name: '2025 - 2029', value: 62 },
        { name: '2020 - 2024', value: 91 },
        { name: '2015 - 2019', value: 54 },
        { name: '2010 - 2014', value: 38 },
        { name: '2005 - 2009', value: 27 },
        { name: '1999 - 2004', value: 19 },
      ],
    },
  ]
  return (
    <RightSidePageLayoutWrapper className="flex flex-col gap-6">
      <h1 className="text-heading-2xs font-semibold font-heading text-txt-black-900">
        Katalog Dokumen
      </h1>
      <div className="flex flex-col gap-3">
        <SearchBarKatalogDokumen />
        <SelectKatalogDokumen />
      </div>
      <KatalogDisplay units={units} />
    </RightSidePageLayoutWrapper>
  )
}
