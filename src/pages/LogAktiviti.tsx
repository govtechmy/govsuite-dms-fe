import MainHeading from '@/components/layout/MainHeading'
import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import LogDisplaySearch from '@/components/page/LogAktiviti/LogDisplaySearch'
import SearchbarLogAktiviti from '@/components/page/LogAktiviti/SearchbarLogAktiviti'
import SelectLogAktiviti from '@/components/page/LogAktiviti/SelectLogAktiviti'
import {
  getLogAktivitiList,
  type GetLogAktivitiListResponse,
  type LogAktivitiItem,
} from '@/services/logAktiviti.svc'
import extractBackendError from '@/utils/extractBackendError'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function LogAktiviti() {
  const [searchParams, setSearchParams] = useSearchParams()
  const pageNumber = Math.max(1, Number(searchParams.get('page')) || 1)
  const pageSize = Math.max(1, Number(searchParams.get('limit')) || 15)

  const [logs, setLogs] = useState<LogAktivitiItem[]>([])
  const [meta, setMeta] = useState<GetLogAktivitiListResponse['meta'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogAktivitiList = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getLogAktivitiList({ page: pageNumber, limit: pageSize })
      setLogs(data.items)
      setMeta(data.meta)
    } catch (err) {
      const backendError = extractBackendError(err)
      setError(backendError?.message ?? 'Gagal memuatkan log aktiviti')
      console.error('Error fetching log aktiviti list:', err)
    } finally {
      setIsLoading(false)
    }
  }, [pageNumber, pageSize])

  useEffect(() => {
    fetchLogAktivitiList()
  }, [fetchLogAktivitiList])

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

  const totalRecords = meta?.totalItems ?? logs.length

  return (
    <RightSidePageLayoutWrapper className="h-full">
      <div className="flex h-full flex-col gap-6">
        <MainHeading>Log Aktiviti</MainHeading>
        <div className="flex flex-col gap-3">
          <SearchbarLogAktiviti />
          <SelectLogAktiviti dropdownJenisDokumen={[]} />
        </div>

        <LogDisplaySearch
          logs={logs}
          isLoading={isLoading}
          error={error}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalRecords={totalRecords}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </RightSidePageLayoutWrapper>
  )
}
