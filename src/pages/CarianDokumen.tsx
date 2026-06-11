import React, { useState } from 'react'
import { Input } from '@govtechmy/myds-react/input'
import { SearchIcon } from '@govtechmy/myds-react/icon'

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Mencari kata kunci:', searchQuery)
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[50vh] px-[24px] py-[32px] bg-transparent">
      <h2 className="text-[20px] leading-[28px] font-semibold text-txt-black-900 mb-8 tracking-normal">
        Carian Dokumen
      </h2>

      {/* Kontena Bar Input & Kotak Tips */}
      <div className="w-full max-w-[640px] flex flex-col gap-3">
        
        <form onSubmit={handleSearch} className="w-full relative">
          <Input
            id="search"
            type="text"
            placeholder="Carian melalui kata kunci"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-5 pr-[140px] py-3 rounded-full border border-otl-gray-200 shadow-sm focus:outline-none placeholder:text-txt-black-500 placeholder:text-body-md text-body-md font-normal text-txt-black-900"
          >
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <span className="text-body-sm text-txt-black-400 max-sm:hidden">
                Tekan <kbd className="px-1.5 py-0.5 bg-bg-neutral-50 border border-otl-gray-200 rounded text-[11px] font-sans font-normal shadow-sm">/</kbd> untuk cari
              </span>
              
              <button
                type="submit"
                aria-label="Cari"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-600 text-bg-white hover:bg-primary-700 active:scale-95 transition-all focus:outline-none"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
            </div>
          </Input>
        </form>

        <div className="w-full border border-primary-200 bg-bg-primary-50 p-5 rounded-2xl shadow-sm text-start">
          <h4 className="text-body-sm font-semibold text-txt-black-700 mb-2">
            Tips membuat carian
          </h4>
          
          <ul className="flex flex-col gap-1 text-body-sm font-normal text-txt-black-500">
            <li>
              Carian kata kunci, contohnya <span className="font-bold text-txt-black-900">minyak</span>
            </li>
            <li>
              Carian kata kunci pelbagai, contohnya <span className="font-bold text-txt-black-900">minyak, banjir</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  )
}