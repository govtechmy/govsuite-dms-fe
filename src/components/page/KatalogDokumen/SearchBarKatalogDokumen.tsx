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

export default function SearchBarKatalogDokumen() {
  const [hasFocus, setHasFocus] = useState(false)
  const [query, setQuery] = useState('')
  const hasQuery = query.length > 0
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
        />
        {query && <SearchBarClearButton onClick={() => setQuery('')} />}

        {!hasFocus && (
          <SearchBarHint className="hidden lg:flex">
            Tekan <Pill size="small">/</Pill> untuk cari
          </SearchBarHint>
        )}
        <SearchBarSearchButton />
      </SearchBarInputContainer>
      <SearchBarResults open={hasQuery && hasFocus}></SearchBarResults>
    </SearchBar>
  )
}
