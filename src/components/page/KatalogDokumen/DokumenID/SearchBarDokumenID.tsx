import { useState, useEffect } from 'react'
import { SearchIcon, ChevronDownIcon, ChevronUpIcon } from '@govtechmy/myds-react/icon'
import { Input, InputIcon } from '@govtechmy/myds-react/input'
import type { SearchPlugin } from '@react-pdf-viewer/search'

interface SearchBarDokumenIDProps {
  searchPluginInstance: SearchPlugin
}

export function SearchBarDokumenID({ searchPluginInstance }: SearchBarDokumenIDProps) {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [currentMatch, setCurrentMatch] = useState(0)
  const [totalMatches, setTotalMatches] = useState(0)
  const { highlight, jumpToNextMatch, jumpToPreviousMatch, clearHighlights } = searchPluginInstance

  useEffect(() => {
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
  }, [searchKeyword])

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
    searchKeyword.trim() && totalMatches > 0
      ? `${currentMatch + 1} daripada ${totalMatches} ditemui`
      : searchKeyword.trim()
        ? 'Tiada hasil ditemui'
        : ''

  return (
    <div className="flex h-14 w-full items-center border-b border-otl-gray-200 bg-bg-white p-8">
      <div className="flex w-full max-w-[1000px] items-center gap-6">
        {/* Search Input */}
        <div className="flex-1">
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
            disabled={!searchKeyword.trim() || totalMatches === 0}
          >
            <ChevronUpIcon className="size-6" />
          </button>
          <button
            type="button"
            className="flex size-6 items-center justify-center text-txt-black-700 hover:text-txt-black-900 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Next"
            onClick={handleNext}
            disabled={!searchKeyword.trim() || totalMatches === 0}
          >
            <ChevronDownIcon className="size-6" />
          </button>
        </div>
      </div>
    </div>
  )
}
