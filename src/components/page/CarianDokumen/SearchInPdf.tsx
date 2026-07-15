import { SearchIcon, ChevronDownIcon, ChevronUpIcon } from '@govtechmy/myds-react/icon'
import { Input, InputIcon } from '@govtechmy/myds-react/input'

interface SearchInPdfProps {
  searchKeyword: string
  onSearchKeywordChange: (keyword: string) => void
  currentMatchIndex: number
  totalMatches: number
  onPreviousMatch: () => void
  onNextMatch: () => void
  isPdfLoaded: boolean
}

export default function SearchInPdf({
  searchKeyword,
  onSearchKeywordChange,
  currentMatchIndex,
  totalMatches,
  onPreviousMatch,
  onNextMatch,
  isPdfLoaded,
}: SearchInPdfProps) {
  const trimmedKeyword = searchKeyword.trim()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchKeywordChange(e.target.value)
  }

  const handlePrevious = () => {
    onPreviousMatch()
  }

  const handleNext = () => {
    onNextMatch()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && trimmedKeyword && totalMatches > 0) {
      e.preventDefault()
      handleNext()
    }
  }

  const displayText =
    isPdfLoaded && trimmedKeyword && totalMatches > 0
      ? `${currentMatchIndex + 1} daripada ${totalMatches} ditemui`
      : isPdfLoaded && trimmedKeyword
        ? 'Tiada hasil ditemui'
        : ''

  return (
    <div className="flex h-14 w-full items-center border-otl-gray-200 p-8">
      <div className="flex w-full max-w-[1000px] items-center gap-6">
        <div className="flex-1 hidden">
          <Input
            placeholder="Cari"
            size="medium"
            value={searchKeyword}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          >
            <InputIcon position="right">
              <SearchIcon className="size-4 text-txt-black-700" />
            </InputIcon>
          </Input>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          {displayText && (
            <span className="whitespace-nowrap text-base font-medium text-txt-black-500">
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
