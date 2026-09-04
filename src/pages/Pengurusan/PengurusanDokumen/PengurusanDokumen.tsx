import { useEffect, useState } from 'react'
import HeaderDocuments from '@/components/shared/HeaderDocuments'
import KatalogUnit from '@/components/shared/KatalogUnit'
import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import { Button } from '@govtechmy/myds-react/button'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getPengurusanUnitsSummary,
  type PengurusanUnitSummary,
} from '@/services/pengurusanDokumen.svc'
import { Spinner } from '@govtechmy/myds-react/spinner'
import { Callout, CalloutContent, CalloutTitle } from '@govtechmy/myds-react/callout'
import extractBackendError from '@/utils/extractBackendError'
import FilterDropdownPengurusanDokumen, {
  ALL_CONFIG_STATUS_VALUE,
} from '@/components/page/Pengurusan/PengurusanDokumen/FilterDropdownPengurusanDokunen'

export default function PengurusanDokumenPage() {
  const navigate = useNavigate()
  const { lang = 'ms' } = useParams<{ lang: string }>()

  const [unitsSummary, setUnitsSummary] = useState<PengurusanUnitSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>(ALL_CONFIG_STATUS_VALUE)

  const configStatus =
    selectedStatus === ALL_CONFIG_STATUS_VALUE
      ? undefined
      : (selectedStatus as 'AKTIF' | 'TIDAK_AKTIF')

  useEffect(() => {
    const fetchUnitsSummary = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getPengurusanUnitsSummary(configStatus)
        setUnitsSummary(data)
      } catch (err) {
        const backendError = extractBackendError(err)
        setError(backendError?.message ?? 'Gagal memuatkan senarai unit')
        console.error('Error fetching pengurusan units summary:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUnitsSummary()
  }, [configStatus])

  return (
    <RightSidePageLayoutWrapper>
      <HeaderDocuments
        title={'Pengurusan Dokumen'}
        buttonChildren={
          <Button
            type="button"
            variant="primary-fill"
            onClick={() => navigate(`/${lang}/pengurusan-dokumen/draf`)}
          >
            + Tambah Tetapan
          </Button>
        }
      />
      <div className="mb-6 w-full sm:w-56">
        <FilterDropdownPengurusanDokumen
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />
      </div>
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="large" />
        </div>
      )}
      {!isLoading && error && (
        <Callout variant="danger">
          <CalloutTitle>Ralat</CalloutTitle>
          <CalloutContent>{error}</CalloutContent>
        </Callout>
      )}
      {!isLoading && !error && <KatalogUnit units={unitsSummary} configStatus={configStatus} />}
    </RightSidePageLayoutWrapper>
  )
}
