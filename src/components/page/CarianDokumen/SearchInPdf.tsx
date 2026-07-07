import { useEffect, useState } from 'react'
import { SearchIcon, ChevronDownIcon, ChevronUpIcon } from '@govtechmy/myds-react/icon'
import { Input, InputIcon } from '@govtechmy/myds-react/input'
import type { SearchPlugin } from '@react-pdf-viewer/search'

interface SearchInPdfProps {
  searchPluginInstance: SearchPlugin
  previewSearchQuery?: string
  documentId?: string
  isPdfLoaded: boolean
}

export default function SearchInPdf({
  searchPluginInstance,
  previewSearchQuery = '',
  documentId,
  isPdfLoaded,
}: SearchInPdfProps) {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [currentMatch, setCurrentMatch] = useState(0)
  const [totalMatches, setTotalMatches] = useState(0)
  const { highlight, jumpToNextMatch, jumpToPreviousMatch, clearHighlights } = searchPluginInstance

  useEffect(() => {
    setSearchKeyword(previewSearchQuery)
  }, [previewSearchQuery])

  useEffect(() => {
    if (!isPdfLoaded) {
      setTotalMatches(0)
      setCurrentMatch(-1)
      return
    }

    if (searchKeyword.trim()) {
      highlight(searchKeyword).then((matches) => {
        setTotalMatches(matches.length)
        setCurrentMatch(matches.length > 0 ? 0 : -1)
      })
    } else {
      clearHighlights()
      setTotalMatches(0)
      setCurrentMatch(-1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeyword, documentId, isPdfLoaded])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value)
  }

  const handlePrevious = () => {
    jumpToPreviousMatch()
    setCurrentMatch((prev) => {
      if (prev > 0) return prev - 1
      return totalMatches - 1
    })
  }

  const handleNext = () => {
    jumpToNextMatch()
    setCurrentMatch((prev) => {
      if (prev < totalMatches - 1) return prev + 1
      return 0
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchKeyword.trim() && totalMatches > 0) {
      e.preventDefault()
      handleNext()
    }
  }

  const displayText =
    isPdfLoaded && searchKeyword.trim() && totalMatches > 0
      ? `${currentMatch + 1} daripada ${totalMatches} ditemui`
      : isPdfLoaded && searchKeyword.trim()
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
            disabled={!isPdfLoaded || !searchKeyword.trim() || totalMatches === 0}
          >
            <ChevronUpIcon className="size-6" />
          </button>
          <button
            type="button"
            className="flex size-6 items-center justify-center text-txt-black-700 hover:text-txt-black-900 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Next"
            onClick={handleNext}
            disabled={!isPdfLoaded || !searchKeyword.trim() || totalMatches === 0}
          >
            <ChevronDownIcon className="size-6" />
          </button>
        </div>
      </div>
    </div>
  )
}
