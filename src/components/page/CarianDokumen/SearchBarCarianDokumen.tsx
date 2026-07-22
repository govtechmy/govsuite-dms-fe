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
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { clx } from '@govtechmy/myds-react/utils'
import { useSearchStore } from '@/store/SearchStore'

interface SearchBarCarianDokumenProps {
  className?: string
}

const SEARCH_LIMIT = '10'

export default function SearchBarCarianDokumen({ className }: SearchBarCarianDokumenProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setQuery = useSearchStore((state) => state.setQuery)
  const resetSearchState = useSearchStore((state) => state.resetSearchState)
  const [hasFocus, setHasFocus] = useState(false)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const hasSearch = search.length > 0

  const clearSearchAndFilters = (params: URLSearchParams) => {
    params.delete('search')
    params.delete('unit')
    params.delete('jenisDokumen')
    params.delete('dateFrom')
    params.delete('dateTo')
    params.delete('sort')
    params.set('page', '1')
    params.set('limit', SEARCH_LIMIT)
  }

  useEffect(() => {
    setSearch(searchParams.get('search') || '')
  }, [searchParams])

  const handleSearch = () => {
    const nextSearch = search.trim()
    const params = new URLSearchParams(searchParams)

    if (nextSearch) {
      params.set('search', nextSearch)
      params.set('page', '1')
      params.set('limit', SEARCH_LIMIT)
      setQuery(nextSearch)
    } else {
      clearSearchAndFilters(params)
      resetSearchState()
    }

    navigate({ search: params.toString() })
  }

  const handleClear = () => {
    const params = new URLSearchParams(searchParams)
    clearSearchAndFilters(params)
    setSearch('')
    resetSearchState()
    navigate({ search: params.toString() })
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
            value={search}
            onValueChange={setSearch}
            onFocus={() => setHasFocus(true)}
            onBlur={() => setHasFocus(false)}
            onKeyDown={handleKeyDown}
          />
          {search && <SearchBarClearButton onClick={handleClear} />}

          {!hasFocus && !hasSearch && (
            <SearchBarHint className="hidden lg:flex">
              Tekan <Pill size="small">/</Pill> untuk cari
            </SearchBarHint>
          )}
          <SearchBarSearchButton onClick={handleSearch} />
        </SearchBarInputContainer>
        <SearchBarResults open={hasSearch && hasFocus} hidden></SearchBarResults>
        {!hasSearch && (
          <div className="w-full border border-otl-primary-200 rounded-lg bg-bg-primary-50 px-3 py-4 flex flex-col gap-2 text-body-sm">
            <div className="text-txt-black-700 font-semibold">Tips membuat carian</div>
            <div className="text-txt-black-500">
              <p> Carian kata kunci, contohnya minyak</p>
              {/* <p>Carian kata kunci pelbagai, contohnya minyak, banjir</p> */}
            </div>
          </div>
        )}
      </div>
    </SearchBar>
  )
}
