import { clx } from '@govtechmy/myds-react/utils'

interface MatchPageSearchProps {
  pageNumbers?: number[]
  activePage?: number
  onSelect?: (page: number) => void
}

export default function MatchPageSearch({
  pageNumbers = [],
  activePage,
  onSelect,
}: MatchPageSearchProps) {
  return (
    <div className="flex h-full max-h-[320px] w-full flex-col gap-2 rounded-lg border border-otl-gray-200 bg-bg-dialog py-2 shadow-sm md:h-[590px] md:max-h-full">
      <p className="px-4 pt-2 text-sm font-medium leading-5 tracking-normal text-txt-black-900">
        {pageNumbers.length > 0 ? `${pageNumbers.length} muka surat ditemui` : 'Muka surat ditemui'}
      </p>

      {pageNumbers.length === 0 ? (
        <p className="px-4 text-body-sm text-txt-black-500">Senarai muka surat belum tersedia.</p>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4">
          {pageNumbers.map((pageNumber) => {
            const isActive = pageNumber === activePage
            return (
              <button
                key={pageNumber}
                type="button"
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onSelect?.(pageNumber)}
                className={clx(
                  'flex w-full shrink-0 flex-col items-start gap-2 rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-primary',
                  isActive
                    ? 'border-otl-primary-200 bg-bg-primary-50'
                    : 'border-otl-gray-200 hover:bg-bg-washed'
                )}
              >
                <span className="text-body-sm font-semibold text-txt-black-900">
                  Muka Surat {pageNumber}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
