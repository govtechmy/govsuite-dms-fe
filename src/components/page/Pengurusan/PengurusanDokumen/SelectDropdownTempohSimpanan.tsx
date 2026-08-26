import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/SelectMydsFix'
import type { RetentionPeriod } from '@/services/dropdown.svc'

interface SelectDropdownTempohSimpananProps {
  retentionPeriods: RetentionPeriod[]
  selectedRetentionPeriod: string
  setSelectedRetentionPeriod: (value: string) => void
}

export default function SelectDropdownTempohSimpanan({
  retentionPeriods,
  selectedRetentionPeriod,
  setSelectedRetentionPeriod,
}: SelectDropdownTempohSimpananProps) {
  return (
    <Select
      size="medium"
      variant="outline"
      value={selectedRetentionPeriod}
      onValueChange={setSelectedRetentionPeriod}
    >
      <SelectTrigger className="w-full data-[placeholder]:text-txt-black-500 font-normal">
        <SelectValue placeholder="Pilih Tempoh Simpanan" />
      </SelectTrigger>
      <SelectContent className="w-full">
        {retentionPeriods.map((period) => (
          <SelectItem key={period.id} value={period.codeName}>
            {period.codeName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
