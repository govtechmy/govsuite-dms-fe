import {
  SearchBar,
  SearchBarInput,
  SearchBarInputContainer,
  SearchBarSearchButton,
  SearchBarResults,
  SearchBarClearButton,
  SearchBarHint,
} from '@govtechmy/myds-react/search-bar'
import { Pill } from '@govtechmy/myds-react/pill'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { clx } from '@govtechmy/myds-react/utils'

interface SearchBarCarianDokumenProps {
  className?: string
}
export default function SearchBarCarianDokumen({ className }: SearchBarCarianDokumenProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [hasFocus, setHasFocus] = useState(false)
  const [query, setQuery] = useState(searchParams.get('query') || '')
  const hasQuery = query.length > 0

  const handleSearch = () => {
    if (query.trim()) {
      const params = new URLSearchParams()
      params.set('query', query.trim())
      navigate({ search: params.toString() })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }
  return (
    <SearchBar
      size="large"
      onBlur={(e) => {
        const blurredByChild = e.currentTarget.contains(e.relatedTarget)
        if (blurredByChild) return
        setHasFocus(false)
      }}
      className={clx('w-full', className)}
    >
      <div className="flex flex-col gap-1">
        <SearchBarInputContainer>
          <SearchBarInput
            placeholder="Carian melalui kata kunci"
            value={query}
            onValueChange={setQuery}
            onFocus={() => setHasFocus(true)}
            onBlur={() => setHasFocus(false)}
            onKeyDown={handleKeyDown}
          />
          {query && <SearchBarClearButton onClick={() => setQuery('')} />}

          {!hasFocus && !hasQuery && (
            <SearchBarHint className="hidden lg:flex">
              Tekan <Pill size="small">/</Pill> untuk cari
            </SearchBarHint>
          )}
          <SearchBarSearchButton onClick={handleSearch} />
        </SearchBarInputContainer>
        <SearchBarResults open={hasQuery && hasFocus} hidden></SearchBarResults>
        {!hasQuery && (
          <div className="w-full border border-otl-primary-200 rounded-lg bg-bg-primary-50 px-3 py-4 flex flex-col gap-2 text-body-sm">
            <div className="text-txt-black-700 font-semibold">Tips membuat carian</div>
            <div className="text-txt-black-500">
              <p> Carian kata kunci, contohnya minyak</p>
              <p>Carian kata kunci pelbagai, contohnya minyak, banjir</p>
            </div>
          </div>
        )}
      </div>
    </SearchBar>
  )
}
