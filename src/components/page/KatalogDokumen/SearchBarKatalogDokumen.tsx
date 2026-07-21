import {
  SearchBar,
  SearchBarInput,
  SearchBarInputContainer,
  SearchBarSearchButton,
  // SearchBarResults,
  SearchBarClearButton,
  SearchBarHint,
} from '@govtechmy/myds-react/search-bar'
import { Pill } from '@govtechmy/myds-react/pill'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function SearchBarKatalogDokumen() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [hasFocus, setHasFocus] = useState(false)
  const [query, setQuery] = useState(searchParams.get('search') || '')
  // const hasQuery = query.length > 0

  const clearSearchAndFilters = (params: URLSearchParams) => {
    params.delete('search')
    params.delete('unit')
    params.delete('jenisDokumen')
    params.delete('year')
    params.delete('dateFrom')
    params.delete('dateTo')
    params.set('page', '1')
  }

  useEffect(() => {
    setQuery(searchParams.get('search') || '')
  }, [searchParams])

  const handleSearch = () => {
    const nextQuery = query.trim()
    const params = new URLSearchParams(searchParams)

    if (nextQuery) {
      params.set('search', nextQuery)
      params.set('page', '1')
    } else {
      clearSearchAndFilters(params)
    }

    navigate({ search: params.toString() })
  }

  const handleClear = () => {
    const params = new URLSearchParams(searchParams)
    clearSearchAndFilters(params)
    setQuery('')
    navigate({ search: params.toString() })
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
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
    >
      <SearchBarInputContainer>
        <SearchBarInput
          placeholder="Search by name"
          value={query}
          onValueChange={setQuery}
          onFocus={() => setHasFocus(true)}
          onBlur={() => setHasFocus(false)}
          onKeyDown={handleKeyDown}
        />
        {query && <SearchBarClearButton onClick={handleClear} />}

        {!hasFocus && (
          <SearchBarHint className="hidden lg:flex">
            Tekan <Pill size="small">/</Pill> untuk cari
          </SearchBarHint>
        )}
        <SearchBarSearchButton onClick={handleSearch} />
      </SearchBarInputContainer>

      {/* <SearchBarResults open={hasQuery && hasFocus}></SearchBarResults> */}
    </SearchBar>
  )
}
