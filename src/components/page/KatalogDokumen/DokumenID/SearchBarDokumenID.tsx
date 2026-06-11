import { SearchIcon, ChevronDownIcon, ChevronUpIcon } from '@govtechmy/myds-react/icon'
import { Input, InputIcon } from '@govtechmy/myds-react/input'

interface SearchBarDokumenIDProps {
  currentPage: number
  totalPages: number
}

export function SearchBarDokumenID({ currentPage, totalPages }: SearchBarDokumenIDProps) {
  return (
    <div className="flex h-14 w-full items-center border-b border-otl-gray-200 bg-bg-white p-8">
      <div className="flex w-full max-w-[1000px] items-center gap-6">
        {/* Search Input */}
        <div className="flex-1">
          <Input placeholder="Cari" size={'medium'}>
            <InputIcon position="right">
              <SearchIcon className="size-4 text-txt-black-700" />
            </InputIcon>
          </Input>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Navigation Controls */}
        <div className="flex items-center gap-3">
          <span className="whitespace-nowrap text-base font-medium text-txt-black-500">
            {currentPage} daripada {totalPages} ditemui
          </span>
          <button
            type="button"
            className="flex size-6 items-center justify-center text-txt-black-700 hover:text-txt-black-900"
            aria-label="Previous"
          >
            <ChevronUpIcon className="size-6" />
          </button>
          <button
            type="button"
            className="flex size-6 items-center justify-center text-txt-black-700 hover:text-txt-black-900"
            aria-label="Next"
          >
            <ChevronDownIcon className="size-6" />
          </button>
        </div>
      </div>
    </div>
  )
}
