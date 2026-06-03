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

interface DropdownWithSearchProps {
  placeholder?: string
  options: string[]
  value: string
  onValueChange: (value: string) => void
  className?: string
}

export default function DropdownWithSearch({
  placeholder = 'Profile Dokumen',
  options,
  value,
  onValueChange,
  className,
}: DropdownWithSearchProps) {
  const [search, setSearch] = useState('')

  const filteredOptions = options.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
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

          {filteredOptions.map((item, index) => (
            <SelectItem key={index} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
