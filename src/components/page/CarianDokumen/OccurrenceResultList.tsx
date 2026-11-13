import { Spinner } from '@govtechmy/myds-react/spinner'
import { clx } from '@govtechmy/myds-react/utils'
import type { PageOccurrenceItem } from './PageOccurrenceResultSearch'

interface OccurrenceResultListProps {
  pages: PageOccurrenceItem[]
  isFetching: boolean
  selectedOccurrence: number | null
  onOccurrenceSelect: (occurrence: number) => void
}

export default function OccurrenceResultList({
  pages,
  isFetching,
  selectedOccurrence,
  onOccurrenceSelect,
}: OccurrenceResultListProps) {
  const occurrences = pages.flatMap((page) => Array.from({ length: page.occurrences }, () => page))

  return (
    <div className="flex h-[300px] w-full flex-col overflow-hidden rounded-xl border border-otl-gray-200 bg-bg-dialog p-2 lg:h-auto lg:min-h-0 lg:flex-1">
      {occurrences.length > 0 ? (
        <ol className="flex h-full flex-col overflow-y-auto">
          {occurrences.map((page, index) => {
            const occurrence = index + 1
            const isSelected = selectedOccurrence === occurrence

            return (
              <li key={occurrence}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onOccurrenceSelect(occurrence)}
                  className={clx(
                    'flex w-full cursor-pointer items-center gap-2 rounded px-2.5 py-1.5 text-left transition-colors',
                    isSelected
                      ? 'bg-primary-600 text-txt-white'
                      : 'text-txt-black-900 hover:bg-bg-washed'
                  )}
                >
                  <span
                    className={clx(
                      'shrink-0 text-body-xs font-medium',
                      !isSelected && 'text-txt-black-500'
                    )}
                  >
                    ({occurrence})
                  </span>
                  <span className="flex-1 truncate text-body-xs font-medium">
                    {page.searchText}
                  </span>
                  <span
                    className={clx('shrink-0 text-body-xs', !isSelected && 'text-txt-black-500')}
                  >
                    M/S {page.pageNumber}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      ) : isFetching ? (
        <div className="flex h-full items-center justify-center">
          <Spinner size="medium" />
        </div>
      ) : (
        <p className="flex h-full items-center justify-center text-body-xs text-txt-black-500">
          Tiada perkataan ditemui
        </p>
      )}
    </div>
  )
}
