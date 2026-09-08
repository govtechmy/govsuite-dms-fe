import PaginationControl from '@/components/shared/PaginationControl'
import type { LogAktivitiItem } from '@/services/logAktiviti.svc'
import { Callout, CalloutContent, CalloutTitle } from '@govtechmy/myds-react/callout'
import { Spinner } from '@govtechmy/myds-react/spinner'
import { Fragment } from 'react'
import LogAktivitiIconManager from './LogAktivitiIconManager'

interface LogDisplaySearchProps {
  logs: LogAktivitiItem[]
  isLoading: boolean
  error: string | null
  pageNumber: number
  pageSize: number
  totalRecords: number
  onPageChange: (newPage: number) => void
  onPageSizeChange: (newSize: number) => void
}

export default function LogDisplaySearch({
  logs,
  isLoading,
  error,
  pageNumber,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
}: LogDisplaySearchProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <Callout variant="danger">
        <CalloutTitle>Ralat</CalloutTitle>
        <CalloutContent>{error}</CalloutContent>
      </Callout>
    )
  }

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        {logs.length > 0 ? (
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            {logs.map((log, index) => {
              const isLast = index === logs.length - 1

              return (
                <Fragment key={log.id}>
                  <div className="flex items-center">
                    <LogAktivitiIconManager action={log.action} />
                  </div>
                  <div className="flex-1 w-full">
                    <div className="text-sm">
                      <span className="font-semibold text-txt-black-900">{log.nama}</span>{' '}
                      <span className="text-txt-black-400 font-normal">({log.email})</span>{' '}
                      <span className="text-txt-black-600">{log.aksi}</span>{' '}
                      {log.sasaran && (
                        <span className="font-semibold text-txt-black-900">
                          {log.sasaran}
                          {log.sasaranEmel && (
                            <span className="font-normal text-txt-black-400">
                              {' '}
                              ({log.sasaranEmel})
                            </span>
                          )}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-txt-black-400 font-normal">
                        <span>{log.tarikh}</span>
                        <span>({log.selangMasa})</span>
                      </div>
                    </div>
                  </div>

                  {!isLast && (
                    <>
                      <div className="flex justify-center">
                        <div className="h-6 w-px bg-otl-gray-200" />
                      </div>
                      <div />
                    </>
                  )}
                </Fragment>
              )
            })}
          </div>
        ) : (
          <Callout variant="info">
            <CalloutTitle>Tiada Hasil</CalloutTitle>
            <CalloutContent>Tiada log aktiviti ditemui.</CalloutContent>
          </Callout>
        )}
      </div>

      <PaginationControl
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={[15, 30, 45, 60]}
      />
    </div>
  )
}
