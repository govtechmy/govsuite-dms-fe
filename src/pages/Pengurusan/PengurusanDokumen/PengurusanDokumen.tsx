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

export default function PengurusanDokumenPage() {
  const navigate = useNavigate()
  const { lang = 'ms' } = useParams<{ lang: string }>()

  const [unitsSummary, setUnitsSummary] = useState<PengurusanUnitSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUnitsSummary = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getPengurusanUnitsSummary()
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
  }, [])

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
      {!isLoading && !error && <KatalogUnit units={unitsSummary} />}
    </RightSidePageLayoutWrapper>
  )
}
