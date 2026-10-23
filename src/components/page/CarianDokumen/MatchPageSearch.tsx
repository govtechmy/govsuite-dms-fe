import { Button } from '@govtechmy/myds-react/button'
import { clx } from '@govtechmy/myds-react/utils'
import { useEffect, useRef } from 'react'
import type { RecordMatchPage } from '@/services/catalog.svc'

interface MatchPageSearchProps {
  matchPages: RecordMatchPage[]
  totalItems: number
  status: 'idle' | 'loading' | 'success' | 'error'
  activePage?: number
  hasMore: boolean
  isLoadingMore: boolean
  onSelect: (page: number) => void
  onLoadMore: () => void
  onRetry: () => void
}

export default function MatchPageSearch({
  matchPages,
  totalItems,
  status,
  activePage,
  hasMore,
  isLoadingMore,
  onSelect,
  onLoadMore,
  onRetry,
}: MatchPageSearchProps) {
  const activeItemRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activePage])

  return (
    <div className="flex h-full max-h-[320px] w-full flex-col gap-3 rounded-lg border border-otl-gray-200 bg-bg-dialog py-2 shadow-sm md:h-[590px] md:max-h-full">
      <p className="px-4 pt-2 text-sm font-medium leading-5 tracking-normal text-txt-black-900">
        {status === 'success' ? `${totalItems} muka surat ditemui` : 'Muka surat ditemui'}
      </p>

      {status === 'loading' || status === 'idle' ? (
        <p role="status" className="px-4 text-body-sm text-txt-black-500">
          Senarai muka surat sedang dimuatkan...
        </p>
      ) : status === 'error' ? (
        <div role="alert" className="flex flex-col items-start gap-2 px-4">
          <p className="text-body-sm text-txt-black-500">Senarai muka surat gagal dimuatkan.</p>
          <Button variant="default-outline" size="small" onClick={onRetry}>
            Cuba Lagi
          </Button>
        </div>
      ) : matchPages.length === 0 ? (
        <p className="px-4 text-body-sm text-txt-black-500">
          Tiada perkataan ditemui dalam dokumen ini.
        </p>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4">
          {matchPages.map((matchPage) => {
            const isActive = matchPage.pageNumber === activePage
            return (
              <button
                key={matchPage.pageNumber}
                ref={isActive ? activeItemRef : undefined}
                type="button"
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onSelect(matchPage.pageNumber)}
                className={clx(
                  'flex w-full shrink-0 flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-primary',
                  isActive
                    ? 'border-otl-primary-200 bg-bg-primary-50'
                    : 'border-otl-gray-200 hover:bg-bg-washed'
                )}
              >
                <span className="text-body-sm font-semibold text-txt-black-900">
                  Muka Surat {matchPage.pageNumber}
                </span>
              </button>
            )
          })}
          {hasMore && (
            <Button
              variant="default-outline"
              size="small"
              className="shrink-0 justify-center"
              onClick={onLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Memuatkan...' : 'Muat lagi'}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
