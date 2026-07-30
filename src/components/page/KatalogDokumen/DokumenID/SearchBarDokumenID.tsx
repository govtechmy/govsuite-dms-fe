import { SearchIcon, ChevronDownIcon, ChevronUpIcon } from '@govtechmy/myds-react/icon'
import { Input, InputIcon } from '@govtechmy/myds-react/input'
import { useEffect, useState } from 'react'

interface SearchBarDokumenIDProps {
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
}

export function SearchBarDokumenID({
  searchKeyword,
  onSearchKeywordChange,
  currentMatchIndex,
  totalMatches,
  onPreviousMatch,
  onNextMatch,
  isPdfLoaded,
  isIndexing,
  currentPage,
  totalPages,
}: SearchBarDokumenIDProps) {
  const trimmedKeyword = searchKeyword.trim()

  // Typing only updates this local draft; the committed searchKeyword (which
  // triggers the actual PDF search) only advances on Enter.
  const [draftKeyword, setDraftKeyword] = useState(searchKeyword)

  useEffect(() => {
    setDraftKeyword(searchKeyword)
  }, [searchKeyword])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraftKeyword(e.target.value)
  }

  const handlePrevious = () => {
    onPreviousMatch()
  }

  const handleNext = () => {
    onNextMatch()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') {
      return
    }

    e.preventDefault()

    const trimmedDraft = draftKeyword.trim()

    if (trimmedDraft !== trimmedKeyword) {
      onSearchKeywordChange(draftKeyword)
      return
    }

    if (trimmedDraft && totalMatches > 0) {
      handleNext()
    }
  }

  const displayText = !trimmedKeyword
    ? ''
    : !isPdfLoaded || isIndexing
      ? 'Dokumen sedang dimuatkan...'
      : totalMatches > 0
        ? `${currentMatchIndex + 1} daripada ${totalMatches} ditemui`
        : 'Tiada hasil ditemui'

  return (
    <div className="sticky top-0 z-10 flex h-14 w-full items-center border-b border-otl-gray-200 bg-bg-white p-8">
      <div className="flex w-full max-w-[1000px] items-center gap-6">
        {/* Search Input */}
        <div className="flex-1">
          <Input
            placeholder="Cari"
            size="medium"
            value={draftKeyword}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            disabled={!isPdfLoaded}
          >
            <InputIcon position="right">
              <SearchIcon className="size-4 text-txt-black-700" />
            </InputIcon>
          </Input>
        </div>
        {isPdfLoaded && totalPages > 0 && (
          <span className="whitespace-nowrap text-base font-medium text-txt-black-500">
            Page : {currentPage}/{totalPages}
          </span>
        )}
        {/* Spacer */}
        <div className="flex-1" />

        {/* Navigation Controls */}
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
