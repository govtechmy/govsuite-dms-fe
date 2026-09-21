import PaginationControl from '@/components/shared/PaginationControl'
import type { LogAktivitiItem } from '@/services/logAktiviti.svc'
import { formatDateTimeUpdatedDisplay } from '@/utils/formatDate'
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
    <div className="flex h-full min-h-0 flex-1 flex-col justify-between gap-4">
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
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
                      <span className="font-semibold text-txt-black-900">
                        {log.actorUserFullName}
                      </span>{' '}
                      <span className="text-txt-black-400 font-normal">({log.actorUsername})</span>{' '}
                      <span className="text-txt-black-600">{log.description}</span>
                      <div className="flex items-center gap-1.5 text-xs text-txt-black-400 font-normal">
                        <span>{formatDateTimeUpdatedDisplay(log.createdAt)}</span>
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
