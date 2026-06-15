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

export default function SearchBarCarianDokumen() {
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
      className="w-full max-w-[560px]"
    >
      <div className="flex flex-col gap-1">
        <SearchBarInputContainer>
          <SearchBarInput
            placeholder="Carian melalui kata kunci"
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
        <div className="w-full border border-otl-primary-200 rounded-lg bg-bg-primary-50 px-3 py-4 flex flex-col gap-2 text-body-sm">
          <div className="text-txt-black-700 font-semibold">Tips membuat carian</div>
          <div className="text-txt-black-500">
            <p> Carian kata kunci, contohnya minyak</p>
            <p>Carian kata kunci pelbagai, contohnya minyak, banjir</p>
          </div>
        </div>
      </div>
    </SearchBar>
  )
}
