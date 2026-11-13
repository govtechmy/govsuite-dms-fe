import type { ProgressState } from '@/components/shared/ProgressResult'
import type { CatalogListMeta, RecordMatchPage } from '@/services/catalog.svc'
import { Spinner } from '@govtechmy/myds-react/spinner'
import { clx } from '@govtechmy/myds-react/utils'

interface PageResultSearchProps {
  pages: RecordMatchPage[] | null
  fetchState: ProgressState
  fetchError: string | null
  selectedPageNumber: number | null
  onPageSelect: (page: number) => void
  meta: CatalogListMeta | null
  isFetchingMore: boolean
}

export default function PageResultSearch({
  pages,
  fetchState,
  fetchError,
  selectedPageNumber,
  onPageSelect,
  meta,
  isFetchingMore,
}: PageResultSearchProps) {
  return (
    <section className="flex h-[240px] w-full flex-col gap-3 rounded-xl border border-otl-gray-200 bg-bg-white p-3 lg:h-auto lg:min-h-0">
      <h2 className="flex items-center gap-2 p-1 text-body-sm font-semibold text-txt-black-900">
        {meta?.totalItems ?? pages?.length ?? 0} muka surat ditemui
        {isFetchingMore && (
          <>
            <Spinner size="small" />
            <span className="sr-only">Memuatkan lagi</span>
          </>
        )}
      </h2>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {fetchState === 'loading' ? (
          <div className="flex items-center gap-2 px-3 py-2 text-body-sm text-txt-black-500">
            <Spinner size="small" />
            Memuatkan muka surat...
          </div>
        ) : fetchState === 'error' ? (
          <p className="px-3 py-2 text-body-sm text-txt-danger">
            {fetchError ?? 'Gagal memuatkan senarai muka surat.'}
          </p>
        ) : !pages || pages.length === 0 ? (
          <p className="px-3 py-2 text-body-sm text-txt-black-500">Tiada muka surat ditemui.</p>
        ) : (
          pages.map((page) => {
            const isSelected = page.pageNumber === selectedPageNumber

            return (
              <button
                key={page.pageNumber}
                type="button"
                onClick={() => onPageSelect(page.pageNumber)}
                aria-current={isSelected ? 'page' : undefined}
                className={clx(
                  'w-full cursor-pointer border-b border-l-2 border-b-otl-gray-200 px-3 py-1 text-left text-body-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fr-primary',
                  isSelected
                    ? 'rounded-r-md border-b-transparent border-l-primary-600 bg-bg-primary-50 text-txt-primary'
                    : 'border-l-transparent text-txt-black-900 hover:bg-bg-washed'
                )}
              >
                Muka Surat {page.pageNumber}
              </button>
            )
          })
        )}
      </div>
    </section>
  )
}
