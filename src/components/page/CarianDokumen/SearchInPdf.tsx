import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@govtechmy/myds-react/icon'

interface SearchInPdfProps {
  searchKeyword: string
  onSearchKeywordChange: (keyword: string) => void
  currentMatchIndex: number
  totalMatches: number
  onPreviousMatch: () => void
  onNextMatch: () => void
  isPdfLoaded: boolean
  isIndexing: boolean
  currentPage: number
  totalPages: number
  onPreviousPage: () => void
  onNextPage: () => void
}

export default function SearchInPdf({
  searchKeyword,
  currentMatchIndex,
  totalMatches,
  onPreviousMatch,
  onNextMatch,
  isPdfLoaded,
  isIndexing,
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
}: SearchInPdfProps) {
  const trimmedKeyword = searchKeyword.trim()

  const handlePrevious = () => {
    onPreviousMatch()
  }

  const handleNext = () => {
    onNextMatch()
  }

  const displayText = !trimmedKeyword
    ? ''
    : !isPdfLoaded || isIndexing
      ? 'Dokumen sedang dimuatkan...'
      : totalMatches > 0
        ? `${currentMatchIndex + 1} daripada ${totalMatches} ditemui`
        : 'Tiada hasil ditemui'

  return (
    <div className="flex min-h-14 w-full items-center border-otl-gray-200 p-2">
      <div className="flex w-full max-w-[1000px] flex-wrap items-center gap-3 sm:gap-6">
        {isPdfLoaded && totalPages > 0 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="flex size-6 items-center justify-center text-txt-black-700 hover:text-txt-black-900 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Halaman sebelum"
              onClick={onPreviousPage}
              disabled={currentPage <= 1}
            >
              <ChevronLeftIcon className="size-5" />
            </button>
            <span className="whitespace-nowrap text-sm font-medium text-txt-black-500 sm:text-base">
              Page : {currentPage}/{totalPages}
            </span>
            <button
              type="button"
              className="flex size-6 items-center justify-center text-txt-black-700 hover:text-txt-black-900 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Halaman seterusnya"
              onClick={onNextPage}
              disabled={currentPage >= totalPages}
            >
              <ChevronRightIcon className="size-5" />
            </button>
          </div>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          {displayText && (
            <span className="whitespace-nowrap text-sm font-medium text-txt-black-500 sm:text-base">
              {displayText}
            </span>
          )}
          <button
            type="button"
            className="flex size-6 items-center justify-center text-txt-black-700 hover:text-txt-black-900 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Previous"
            onClick={handlePrevious}
            disabled={!isPdfLoaded || !trimmedKeyword || totalMatches === 0}
          >
            <ChevronUpIcon className="size-6" />
          </button>
          <button
            type="button"
            className="flex size-6 items-center justify-center text-txt-black-700 hover:text-txt-black-900 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Next"
            onClick={handleNext}
            disabled={!isPdfLoaded || !trimmedKeyword || totalMatches === 0}
          >
            <ChevronDownIcon className="size-6" />
          </button>
        </div>
      </div>
    </div>
  )
}
