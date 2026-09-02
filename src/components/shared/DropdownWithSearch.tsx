import { SearchIcon } from '@govtechmy/myds-react/icon'
import { Input, InputIcon } from '@govtechmy/myds-react/input'
import { useState } from 'react'

import {
  SelectHeader,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './SelectMydsFix'

/**
 * An option can be a plain string (value and label are the same), or an
 * explicit `{ value, label }` pair when the underlying value (e.g. an id)
 * needs to differ from what's displayed/searched.
 */
export type DropdownWithSearchOption = string | { value: string; label: string }

interface DropdownWithSearchProps {
  placeholder?: string
  options: DropdownWithSearchOption[]
  value: string
  onValueChange: (value: string) => void
  className?: string
}

const normalizeOption = (option: DropdownWithSearchOption): { value: string; label: string } =>
  typeof option === 'string' ? { value: option, label: option } : option

export default function DropdownWithSearch({
  placeholder = 'Profile Dokumen',
  options,
  value,
  onValueChange,
  className,
}: DropdownWithSearchProps) {
  const [search, setSearch] = useState('')

  const normalizedOptions = options.map(normalizeOption)
  const filteredOptions = normalizedOptions.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex gap-3">
      <Select
        size="medium"
        variant="outline"
        onValueChange={(selectedValue) => {
          onValueChange(selectedValue)
          setSearch('')
        }}
        value={value}
      >
        <SelectTrigger className={`${className ?? ''} data-[placeholder]:text-txt-black-500`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className={className}>
          <SelectHeader>
            <Input
              size="small"
              onKeyDown={(e) => e.stopPropagation()}
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            >
              <InputIcon position="right">
                <SearchIcon className="text-otl-gray-300" />
              </InputIcon>
            </Input>
          </SelectHeader>

          {filteredOptions.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
