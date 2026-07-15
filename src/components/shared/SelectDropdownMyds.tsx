import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './SelectMydsFix'
import type { AccessLevel } from '@/services/dropdown.svc'

interface SelectDropdownMydsProps {
  accessLevel: AccessLevel[]
  selectedAccessLevel: string
  setSelectedAccessLevel: (value: string) => void
}

export default function SelectDropdownMyds({
  accessLevel,
  selectedAccessLevel,
  setSelectedAccessLevel,
}: SelectDropdownMydsProps) {
  return (
    <Select
      size="medium"
      variant="outline"
      value={selectedAccessLevel}
      onValueChange={setSelectedAccessLevel}
    >
      <SelectTrigger className="w-full data-[placeholder]:text-txt-black-500 font-normal">
        <SelectValue placeholder="Pilih Tahap Keselamatan" />
      </SelectTrigger>
      <SelectContent className="w-full">
        {accessLevel.map((peringkat) => (
          <SelectItem key={peringkat.codeName} value={peringkat.codeName}>
            {peringkat.codeName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
