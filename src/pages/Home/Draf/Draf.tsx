import MainHeading from '@/components/layout/MainHeading'
import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import KatalogDisplaySearch from '@/components/page/KatalogDokumen/KatalogDisplaySearch'
import SearchBarKatalogDokumen from '@/components/page/KatalogDokumen/SearchBarKatalogDokumen'
import SelectCarianDokumen from '@/components/shared/SelectCarianDokumen'
import {
  getSearchKatalogItems,
  type CatalogDocumentItem,
  type CatalogListMeta,
} from '@/services/catalog.svc'
import {
  getDropdownJenisDokumen,
  getDropdownUnits,
  type DropdownJenisDokumen,
  type DropdownUnit,
} from '@/services/dropdown.svc'

import { ArrowBackIcon } from '@govtechmy/myds-react/icon'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

export default function DrafPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { lang } = useParams()
  const activeLang = lang ?? localStorage.getItem('lang') ?? 'ms'
  const query = searchParams.get('search')?.trim() || ''
  const unit = searchParams.get('unit') || ''
  const jenisDokumen = searchParams.get('jenisDokumen') || ''
  const dateFrom = searchParams.get('dateFrom') || ''
  const dateTo = searchParams.get('dateTo') || ''
  const pageNumber = Math.max(1, Number(searchParams.get('page')) || 1)
  const pageSize = Math.max(1, Number(searchParams.get('limit')) || 15)
  const [catalogItems, setCatalogItems] = useState<CatalogDocumentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchMeta, setSearchMeta] = useState<CatalogListMeta | null>(null)
  const [dropdownUnits, setDropdownUnits] = useState<DropdownUnit[]>([])
  const [dropdownJenisDokumen, setDropdownJenisDokumen] = useState<DropdownJenisDokumen[]>([])

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [unitsData, jenisDokumenData] = await Promise.all([
          getDropdownUnits(),
          getDropdownJenisDokumen(),
        ])
        setDropdownUnits(unitsData)
        setDropdownJenisDokumen(jenisDokumenData)
      } catch (err) {
        console.error('Error fetching dropdown data:', err)
      }
    }

    fetchDropdownData()
  }, [])

  useEffect(() => {
    const fetchSearch = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getSearchKatalogItems({
          query,
          unit,
          jenisDokumen,
          dateFrom,
          dateTo,
          page: pageNumber,
          limit: pageSize,
          status: 'DRAF',
        })
        setCatalogItems(data.items)
        setSearchMeta(data.meta)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch searching data')
        console.error('Error fetching searching data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSearch()
  }, [query, unit, jenisDokumen, dateFrom, dateTo, pageNumber, pageSize])

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(newPage))
    setSearchParams(params)
  }

  const handlePageSizeChange = (newSize: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('limit', String(newSize))
    params.set('page', '1')
    setSearchParams(params)
  }

  return (
    <RightSidePageLayoutWrapper className="h-full">
      <div className="flex h-full flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex gap-3 items-center">
            <button
              type="button"
              onClick={() => navigate(`/${activeLang}`)}
              aria-label="Kembali ke halaman utama"
              className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-primary"
            >
              <ArrowBackIcon />
            </button>
            <MainHeading>Dokumen Draf</MainHeading>
          </div>
          <p className="text-body-sm font-medium text-txt-black-500">
            Terdapat {searchMeta?.totalItems ?? catalogItems.length} dokumen draf.
          </p>
          <SearchBarKatalogDokumen />
          <SelectCarianDokumen
            dropdownUnits={dropdownUnits}
            dropdownJenisDokumen={dropdownJenisDokumen}
          />
        </div>

        <KatalogDisplaySearch
          hasilCarianDisplay={false}
          documents={catalogItems}
          isLoading={isLoading}
          error={error}
          searchKeyword={query || 'semua dokumen'}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalRecords={searchMeta?.totalItems ?? catalogItems.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onItemClick={(recordId) => navigate(`/${activeLang}/muatnaik-dokumen/${recordId}`)}
        />
      </div>
    </RightSidePageLayoutWrapper>
  )
}
