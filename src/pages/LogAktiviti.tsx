import MainHeading from '@/components/layout/MainHeading'
import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import LogDisplaySearch from '@/components/page/LogAktiviti/LogDisplaySearch'
import SearchbarLogAktiviti from '@/components/page/LogAktiviti/SearchbarLogAktiviti'
import SelectLogAktiviti from '@/components/page/LogAktiviti/SelectLogAktiviti'
import { getLogCategories, type DropdownLogCategory } from '@/services/dropdown.svc'
import {
  downloadAuditLogs,
  getLogAktivitiList,
  type GetLogAktivitiListResponse,
  type LogAktivitiItem,
  type LogCategory,
} from '@/services/logAktiviti.svc'
import extractBackendError from '@/utils/extractBackendError'
import { useToast } from '@govtechmy/myds-react/hooks'
import { AutoToast } from '@govtechmy/myds-react/toast'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function LogAktiviti() {
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const pageNumber = Math.max(1, Number(searchParams.get('page')) || 1)
  const pageSize = Math.max(1, Number(searchParams.get('limit')) || 15)
  const search = searchParams.get('search') || undefined
  const category = (searchParams.get('category') || undefined) as LogCategory | undefined
  const dateFrom = searchParams.get('dateFrom') || undefined
  const dateTo = searchParams.get('dateTo') || undefined

  const [logs, setLogs] = useState<LogAktivitiItem[]>([])
  const [meta, setMeta] = useState<GetLogAktivitiListResponse['meta'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dropdownCategories, setDropdownCategories] = useState<DropdownLogCategory[]>([])
  const [isDownloading, setIsDownloading] = useState(false)

  const fetchLogAktivitiList = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getLogAktivitiList({
        search,
        category,
        dateFrom,
        dateTo,
        page: pageNumber,
        limit: pageSize,
      })
      setLogs(data.items)
      setMeta(data.meta)
    } catch (err) {
      const backendError = extractBackendError(err)
      setError(backendError?.message ?? 'Gagal memuatkan log aktiviti')
      console.error('Error fetching log aktiviti list:', err)
    } finally {
      setIsLoading(false)
    }
  }, [search, category, dateFrom, dateTo, pageNumber, pageSize])

  useEffect(() => {
    fetchLogAktivitiList()
  }, [fetchLogAktivitiList])

  useEffect(() => {
    const fetchDropdownCategories = async () => {
      try {
        const categoriesData = await getLogCategories()
        setDropdownCategories(categoriesData)
      } catch (err) {
        console.error('Error fetching log categories:', err)
      }
    }

    fetchDropdownCategories()
  }, [])

  const handleDownloadLog = async () => {
    if (isDownloading) return

    setIsDownloading(true)
    try {
      const { blob, fileName } = await downloadAuditLogs({ search, category, dateFrom, dateTo })

      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      console.error('Error downloading log aktiviti:', err)
      const backendError = extractBackendError(err)
      toast({
        variant: 'error',
        title: 'Muat Turun Log Gagal',
        description: `${backendError?.code ?? 'REQUEST_FAILED'} : ${
          backendError?.message ?? 'Sila cuba lagi.'
        }`,
      })
    } finally {
      setIsDownloading(false)
    }
  }

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
    <RightSidePageLayoutWrapper className="h-full pb-0 mb-0">
      <div className="flex h-full flex-col gap-6">
        <MainHeading>Log Aktiviti</MainHeading>
        <div className="flex flex-col gap-3">
          <SearchbarLogAktiviti />
          <SelectLogAktiviti
            dropdownCategories={dropdownCategories}
            onDownload={handleDownloadLog}
            isDownloading={isDownloading}
          />
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
      <AutoToast />
    </RightSidePageLayoutWrapper>
  )
}
