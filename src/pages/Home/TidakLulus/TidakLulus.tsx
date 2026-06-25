import MainHeading from '@/components/layout/MainHeading'
import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import MetadataModalTidakLulus from '@/components/page/Homepage/TidakLulus/MetadataModalTidakLulus'
import SelectCarianDokumenTidakLulus from '@/components/page/Homepage/TidakLulus/SelectCarianDokumenTidakLulus'
import KatalogDisplaySearch from '@/components/page/KatalogDokumen/KatalogDisplaySearch'
import SearchBarKatalogDokumen from '@/components/page/KatalogDokumen/SearchBarKatalogDokumen'
import {
  getSearchKatalogItems,
  getDropdownJenisDokumen,
  getDropdownUnits,
  type CatalogDocumentItem,
  type CatalogListMeta,
  type DropdownJenisDokumen,
  type DropdownUnit,
} from '@/services/catalog.svc'
import { ArrowBackIcon } from '@govtechmy/myds-react/icon'
import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

export default function TidakLulusPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { lang } = useParams()
  const activeLang = lang ?? localStorage.getItem('lang') ?? 'ms'
  const query = searchParams.get('search')?.trim() || ''
  const unit = searchParams.get('unit') || ''
  const jenisDokumen = searchParams.get('jenisDokumen') || ''
  const dateFrom = searchParams.get('dateFrom') || ''
  const dateTo = searchParams.get('dateTo') || ''

  const [catalogItems, setCatalogItems] = useState<CatalogDocumentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [searchMeta, setSearchMeta] = useState<CatalogListMeta | null>(null)
  const [dropdownUnits, setDropdownUnits] = useState<DropdownUnit[]>([])
  const [dropdownJenisDokumen, setDropdownJenisDokumen] = useState<DropdownJenisDokumen[]>([])
  const [isMetadataDialogOpen, setIsMetadataDialogOpen] = useState(false)

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
          status: 'TIDAK_DILULUSKAN',
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

  useEffect(() => {
    setPageNumber(1)
  }, [query, unit, jenisDokumen, dateFrom, dateTo])

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPageNumber(1)
  }

  const totalRecords = searchMeta?.totalItems ?? catalogItems.length

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
            <MainHeading>Dokumen Tidak Diluluskan</MainHeading>
          </div>
          <p className="text-body-sm font-medium text-txt-black-500">
            Terdapat {totalRecords} dokumen tidak diluluskan.
          </p>
          <SearchBarKatalogDokumen />
          <SelectCarianDokumenTidakLulus
            dropdownUnits={dropdownUnits}
            dropdownJenisDokumen={dropdownJenisDokumen}
          />
        </div>

        <MetadataModalTidakLulus
          open={isMetadataDialogOpen}
          onOpenChange={setIsMetadataDialogOpen}
          lokasiFolder={'JKKPN > 2025 - 2029 > 2025 > January > Minit Jemaah Menteri Bil. 12/2026'}
        />

        <KatalogDisplaySearch
          hasilCarianDisplay={false}
          documents={catalogItems}
          isLoading={isLoading}
          error={error}
          searchKeyword={query || 'semua dokumen'}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalRecords={totalRecords}
          onPageChange={setPageNumber}
          onPageSizeChange={handlePageSizeChange}
          onItemClick={() => setIsMetadataDialogOpen(true)}
        />
      </div>
    </RightSidePageLayoutWrapper>
  )
}
