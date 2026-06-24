import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import KatalogDisplay from '@/components/page/KatalogDokumen/KatalogDisplay'
import KatalogDisplaySearch from '@/components/page/KatalogDokumen/KatalogDisplaySearch'
import SearchBarKatalogDokumen from '@/components/page/KatalogDokumen/SearchBarKatalogDokumen'
import SelectKatalogDokumen from '@/components/page/KatalogDokumen/SelectKatalogDokumen'
import {
  getCatalogBase,
  getDropdownJenisDokumen,
  getDropdownUnits,
  getSearchKatalogItems,
  type CatalogBaseItem,
  type CatalogDocumentItem,
  type CatalogListMeta,
  type DropdownJenisDokumen,
  type DropdownUnit,
} from '@/services/catalog.svc'
import { Spinner } from '@govtechmy/myds-react/spinner'
import { Callout, CalloutContent, CalloutTitle } from '@govtechmy/myds-react/callout'

export default function KatalogDokumenPage() {
  const [searchParams] = useSearchParams()
  const [catalogBase, setCatalogBase] = useState<CatalogBaseItem[]>([])
  const [catalogItems, setCatalogItems] = useState<CatalogDocumentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [searchMeta, setSearchMeta] = useState<CatalogListMeta | null>(null)
  const [dropdownUnits, setDropdownUnits] = useState<DropdownUnit[]>([])
  const [dropdownJenisDokumen, setDropdownJenisDokumen] = useState<DropdownJenisDokumen[]>([])
  const query = searchParams.get('search')?.trim() || ''
  const unit = searchParams.get('unit') || ''
  const jenisDokumen = searchParams.get('jenisDokumen') || ''
  const dateFrom = searchParams.get('dateFrom') || ''
  const dateTo = searchParams.get('dateTo') || ''

  useEffect(() => {
    const fetchCatalogBase = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getCatalogBase()
        setCatalogBase(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch catalog Base')
        console.error('Error fetching catalog Base:', err)
      } finally {
        setIsLoading(false)
      }
    }
    const fetchDropdownUnits = async () => {
      try {
        const data = await getDropdownUnits()
        setDropdownUnits(data)
      } catch (err) {
        console.error('Error fetching dropdown units:', err)
      }
    }
    const fetchDropdownJenisDokumen = async () => {
      try {
        const data = await getDropdownJenisDokumen()
        setDropdownJenisDokumen(data)
      } catch (err) {
        console.error('Error fetching dropdown unit dokumen:', err)
      }
    }
    fetchCatalogBase()
    fetchDropdownUnits()
    fetchDropdownJenisDokumen()
  }, [])

  useEffect(() => {
    const fetchSearch = async () => {
      if (!query) {
        setCatalogItems([])
        setSearchMeta(null)
        return
      }

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

  return (
    <RightSidePageLayoutWrapper className="flex flex-col gap-6">
      <h1 className="text-heading-2xs font-semibold font-heading text-txt-black-900">
        Katalog Dokumen
      </h1>
      <div className="flex flex-col gap-3">
        <SearchBarKatalogDokumen />
        <SelectKatalogDokumen
          dropdownUnits={dropdownUnits}
          dropdownJenisDokumen={dropdownJenisDokumen}
        />
      </div>
      {query ? (
        <KatalogDisplaySearch
          documents={catalogItems}
          isLoading={isLoading}
          error={error}
          searchKeyword={query}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalRecords={searchMeta?.totalItems ?? catalogItems.length}
          onPageChange={setPageNumber}
          onPageSizeChange={handlePageSizeChange}
        />
      ) : (
        <>
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <Spinner size="large" />
            </div>
          )}
          {error && (
            <Callout variant="danger">
              <CalloutTitle>Ralat</CalloutTitle>
              <CalloutContent>{error}</CalloutContent>
            </Callout>
          )}
          {!isLoading && !error && <KatalogDisplay catalogBase={catalogBase} />}
        </>
      )}
    </RightSidePageLayoutWrapper>
  )
}
