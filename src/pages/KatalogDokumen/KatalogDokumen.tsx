import { useState, useEffect } from 'react'
import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import KatalogDisplay, { type Unit } from '@/components/page/KatalogDokumen/KatalogDisplay'
import SearchBarKatalogDokumen from '@/components/page/KatalogDokumen/SearchBarKatalogDokumen'
import SelectKatalogDokumen from '@/components/page/KatalogDokumen/SelectKatalogDokumen'
import { getCatalogUnits } from '@/services/catalog.svc'
import { Spinner } from '@govtechmy/myds-react/spinner'
import { Callout, CalloutContent, CalloutTitle } from '@govtechmy/myds-react/callout'

export default function KatalogDokumenPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCatalogUnits = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getCatalogUnits()
        setUnits(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch catalog data')
        console.error('Error fetching catalog units:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCatalogUnits()
  }, [])

  return (
    <RightSidePageLayoutWrapper className="flex flex-col gap-6">
      <h1 className="text-heading-2xs font-semibold font-heading text-txt-black-900">
        Katalog Dokumen
      </h1>
      <div className="flex flex-col gap-3">
        <SearchBarKatalogDokumen />
        <SelectKatalogDokumen />
      </div>
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
      {!isLoading && !error && <KatalogDisplay units={units} />}
    </RightSidePageLayoutWrapper>
  )
}
