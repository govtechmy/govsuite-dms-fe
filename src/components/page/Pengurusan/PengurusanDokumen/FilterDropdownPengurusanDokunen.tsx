//fitler dropdown  only have 2, Aktif and Tidak-aktif

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/SelectMydsFix'

export const ALL_CONFIG_STATUS_VALUE = 'SEMUA'

interface FilterDropdownPengurusanDokumenProps {
  selectedStatus: string
  setSelectedStatus: (value: string) => void
}

export default function FilterDropdownPengurusanDokumen({
  selectedStatus,
  setSelectedStatus,
}: FilterDropdownPengurusanDokumenProps) {
  return (
    <Select
      size="medium"
      variant="outline"
      value={selectedStatus}
      onValueChange={setSelectedStatus}
    >
      <SelectTrigger className="w-full data-[placeholder]:text-txt-black-500 font-normal">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent className="w-full">
        <SelectItem value={ALL_CONFIG_STATUS_VALUE}>Semua Status</SelectItem>
        <SelectItem value="AKTIF">Aktif</SelectItem>
        <SelectItem value="TIDAK_AKTIF">Tidak Aktif</SelectItem>
      </SelectContent>
    </Select>
  )
}
