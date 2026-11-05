import { clx } from '@govtechmy/myds-react/utils'

interface PageResultSearchProps {
  currentPage: number
  totalPages: number
  onPageSelect: (page: number) => void
}

export default function PageResultSearch({
  currentPage,
  totalPages,
  onPageSelect,
}: PageResultSearchProps) {
  return (
    <section className="flex h-[240px] w-full flex-col gap-3 rounded-xl border border-otl-gray-200 bg-bg-white p-3 lg:h-auto lg:min-h-0">
      <h2 className="p-1 text-body-sm font-semibold text-txt-black-900">
        {/* Placeholder */}
        12 muka surat ditemui
      </h2>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1
          const isSelected = page === currentPage

          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageSelect(page)}
              aria-current={isSelected ? 'page' : undefined}
              className={clx(
                'w-full cursor-pointer border-b border-l-2 border-b-otl-gray-200 px-3 py-1 text-left text-body-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fr-primary',
                isSelected
                  ? 'rounded-r-md border-b-transparent border-l-primary-600 bg-bg-primary-50 text-txt-primary'
                  : 'border-l-transparent text-txt-black-900 hover:bg-bg-washed'
              )}
            >
              Muka Surat 1
            </button>
          )
        })}
      </div>
    </section>
  )
}
