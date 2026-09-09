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
import { getRingkasanEksekutif } from '@/services/infoHomepage.svc'
import { buildYearRange } from '@/utils/buildYearRange'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

export default function KegemaranPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { lang } = useParams()
  const activeLang = lang ?? localStorage.getItem('lang') ?? 'ms'
  const query = searchParams.get('search')?.trim() || ''
  const unit = searchParams.get('unit') || ''
  const jenisDokumen = searchParams.get('jenisDokumen') || ''
  const year = searchParams.get('year') || ''
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
  const [dropdownYears, setDropdownYears] = useState<string[]>([])

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [unitsData, jenisDokumenData, ringkasanData] = await Promise.all([
          getDropdownUnits(),
          getDropdownJenisDokumen(),
          getRingkasanEksekutif('all'),
        ])

        const oldestYear = ringkasanData.oldest ?? new Date().getFullYear()
        const newestYear = ringkasanData.newest ?? oldestYear
        const years = buildYearRange(oldestYear, newestYear).map((yearValue) => String(yearValue))

        setDropdownUnits(unitsData)
        setDropdownJenisDokumen(jenisDokumenData)
        setDropdownYears(years)
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
        // TODO: filter by favourite documents once the backend exposes a status/param for it.
        const data = await getSearchKatalogItems({
          query,
          unit,
          jenisDokumen,
          year,
          dateFrom,
          dateTo,
          page: pageNumber,
          limit: pageSize,
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
  }, [query, unit, jenisDokumen, year, dateFrom, dateTo, pageNumber, pageSize])

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
          <MainHeading>Kegemaran</MainHeading>
          <p className="text-body-sm font-medium text-txt-black-500">
            Terdapat {searchMeta?.totalItems ?? catalogItems.length} dokumen kegemaran.
          </p>
          <SearchBarKatalogDokumen />
          <SelectCarianDokumen
            dropdownUnits={dropdownUnits}
            dropdownJenisDokumen={dropdownJenisDokumen}
            dropdownYears={dropdownYears}
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
          onItemClick={(recordId) => navigate(`/${activeLang}/katalog-dokumen/${recordId}`)}
        />
      </div>
    </RightSidePageLayoutWrapper>
  )
}
