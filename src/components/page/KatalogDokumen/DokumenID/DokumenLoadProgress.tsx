import { Callout, CalloutContent, CalloutTitle } from '@govtechmy/myds-react/callout'

interface DokumenLoadProgressProps {
  loadedPages: number
  totalPages: number
}

const TITLE = 'Memuatkan kandungan dokumen'

export function DokumenLoadProgress({ loadedPages, totalPages }: DokumenLoadProgressProps) {
  const percentage =
    totalPages > 0 ? Math.min(Math.round((loadedPages / totalPages) * 100), 100) : 0
  const pageCount = `${loadedPages} daripada ${totalPages} halaman`

  return (
    <Callout variant="info" role="status" className="w-full">
      <div className="flex items-center justify-between gap-3">
        <CalloutTitle>{TITLE}</CalloutTitle>
        {/* Hidden from screen readers so each chunk is not announced; the progressbar exposes it */}
        <span aria-hidden="true" className="shrink-0 text-sm font-semibold tabular-nums">
          {totalPages > 0 && (
            <span className="mr-2 hidden font-normal text-txt-black-700 sm:inline">
              {pageCount}
            </span>
          )}
          {percentage}%
        </span>
      </div>
      <CalloutContent>Carian tersedia selepas selesai.</CalloutContent>
      <div
        role="progressbar"
        aria-label={TITLE}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        aria-valuetext={totalPages > 0 ? `${percentage}%, ${pageCount}` : `${percentage}%`}
        className="!mt-2 h-1.5 w-full overflow-hidden rounded-full bg-primary-200"
      >
        <div
          className="h-full rounded-full bg-primary-600 transition-[width] duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </Callout>
  )
}
