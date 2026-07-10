import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/SelectMydsFix'
import type { DropdownUnit } from '@/services/dropdown.svc'

interface SelectDropdownUnitProps {
  dropdownUnits: DropdownUnit[]
  selectedUnit: string | undefined
  onUnitChange: (unitCode: string) => void
}

export default function SelectDropdownUnit({
  dropdownUnits,
  selectedUnit,
  onUnitChange,
}: SelectDropdownUnitProps) {
  return (
    <Select size="medium" variant="outline" value={selectedUnit || ''} onValueChange={onUnitChange}>
      <SelectTrigger className="w-full data-[placeholder]:text-txt-black-500 font-normal">
        <SelectValue placeholder="Pilih Unit" />
      </SelectTrigger>
      <SelectContent className="w-full">
        {dropdownUnits.map((unitValue) => (
          <SelectItem key={unitValue.code} value={unitValue.code}>
            {unitValue.codeName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
