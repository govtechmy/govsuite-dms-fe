import { Spinner } from '@govtechmy/myds-react/spinner'
import type { PageOccurrenceItem } from './PageOccurrenceResultSearch'

interface PageOccurrenceListProps {
  items: PageOccurrenceItem[]
  fetchingPageNumber: number | null
  failedPageNumbers: number[]
}

export default function PageOccurrenceList({
  items,
  fetchingPageNumber,
  failedPageNumbers,
}: PageOccurrenceListProps) {
  return (
    <div className="flex max-h-[200px] w-full flex-col overflow-hidden rounded-xl border border-otl-gray-200 bg-bg-dialog p-2 lg:min-h-0 lg:flex-1">
      <ul className="flex h-full flex-col overflow-y-auto">
        {items.map((item) => (
          <li
            key={item.pageNumber}
            aria-busy={fetchingPageNumber === item.pageNumber}
            className="flex w-full items-center gap-2 rounded px-2.5 py-1.5"
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="truncate text-body-xs font-medium text-txt-black-900">
                {item.searchText}
              </p>
              {failedPageNumbers.includes(item.pageNumber) ? (
                <p className="text-body-xs text-txt-danger">Gagal dimuatkan</p>
              ) : (
                <p className="text-body-xs text-txt-black-500">M/S {item.pageNumber}</p>
              )}
            </div>
            {fetchingPageNumber === item.pageNumber ? (
              <Spinner size="small" />
            ) : (
              <span className="shrink-0 rounded-full bg-bg-washed px-2 py-0.5 text-body-xs font-medium text-txt-black-700">
                {item.occurrences}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
