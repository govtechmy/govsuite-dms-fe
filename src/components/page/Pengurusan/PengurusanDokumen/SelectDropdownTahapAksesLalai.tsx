import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/SelectMydsFix'
import type { AccessLevel } from '@/services/dropdown.svc'

interface SelectDropdownTahapAksesLalaiProps {
  accessLevels: AccessLevel[]
  selectedAccessLevel: string
  setSelectedAccessLevel: (value: string) => void
}

export default function SelectDropdownTahapAksesLalai({
  accessLevels,
  selectedAccessLevel,
  setSelectedAccessLevel,
}: SelectDropdownTahapAksesLalaiProps) {
  return (
    <Select
      size="medium"
      variant="outline"
      value={selectedAccessLevel}
      onValueChange={setSelectedAccessLevel}
    >
      <SelectTrigger className="w-full data-[placeholder]:text-txt-black-500 font-normal">
        <SelectValue placeholder="Pilih Tahap Akses" />
      </SelectTrigger>
      <SelectContent className="w-full">
        {accessLevels.map((level) => (
          <SelectItem key={level.id} value={level.codeName}>
            {level.codeName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
