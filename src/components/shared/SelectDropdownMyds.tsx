import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './SelectMydsFix'
import type { AccessLevel } from '@/services/dropdown.svc'

interface SelectDropdownMydsProps {
  peringkatKeselamatan: AccessLevel[]
  selectedPeringkatKeselamatan: string
  setSelectedPeringkatKeselamatan: (value: string) => void
}

export default function SelectDropdownMyds({
  peringkatKeselamatan,
  selectedPeringkatKeselamatan,
  setSelectedPeringkatKeselamatan,
}: SelectDropdownMydsProps) {
  return (
    <Select
      size="medium"
      variant="outline"
      value={selectedPeringkatKeselamatan}
      onValueChange={setSelectedPeringkatKeselamatan}
    >
      <SelectTrigger className="w-full data-[placeholder]:text-txt-black-500 font-normal">
        <SelectValue placeholder="Pilih Tahap Keselamatan" />
      </SelectTrigger>
      <SelectContent className="w-full">
        {peringkatKeselamatan.map((peringkat) => (
          <SelectItem key={peringkat.codeName} value={peringkat.codeName}>
            {peringkat.codeName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
