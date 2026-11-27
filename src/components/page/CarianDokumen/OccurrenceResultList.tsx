import { Spinner } from '@govtechmy/myds-react/spinner'
import { clx } from '@govtechmy/myds-react/utils'
import type { PageOccurrenceItem } from './PageOccurrenceResultSearch'

interface OccurrenceResultListProps {
  pages: PageOccurrenceItem[]
  isFetching: boolean
  hasError: boolean
  selectedOccurrence: number | null
  onOccurrenceSelect: (occurrence: number) => void
}

export default function OccurrenceResultList({
  pages,
  isFetching,
  hasError,
  selectedOccurrence,
  onOccurrenceSelect,
}: OccurrenceResultListProps) {
  // Backend counts are authoritative; a snippet may be missing when the page has no extractable text.
  const occurrences = pages.flatMap((page) =>
    Array.from({ length: page.occurrences }, (_, index) => ({
      pageNumber: page.pageNumber,
      searchText: page.searchText,
      snippet: page.snippets[index],
    }))
  )

  return (
    <div className="flex h-[300px] w-full flex-col overflow-hidden rounded-xl border border-otl-gray-200 bg-bg-dialog p-2 lg:h-auto lg:min-h-0 lg:flex-1">
      {occurrences.length > 0 ? (
        <ol className="flex h-full flex-col overflow-y-auto">
          {occurrences.map((item, index) => {
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
                  <span
                    className="flex-1 truncate text-body-xs"
                    title={
                      item.snippet
                        ? `${item.snippet.before}${item.snippet.match}${item.snippet.after}`
                        : item.searchText
                    }
                  >
                    {item.snippet ? (
                      <>
                        {item.snippet.before}
                        <span className="font-semibold">{item.snippet.match}</span>
                        {item.snippet.after}
                      </>
                    ) : (
                      <span className="font-medium">{item.searchText}</span>
                    )}
                  </span>
                  <span
                    className={clx('shrink-0 text-body-xs', !isSelected && 'text-txt-black-500')}
                  >
                    M/S {item.pageNumber}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      ) : hasError ? (
        <p className="flex h-full items-center justify-center text-body-xs text-txt-danger">
          Gagal memuatkan perkataan
        </p>
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
