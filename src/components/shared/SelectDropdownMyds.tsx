import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './SelectMydsFix'

interface SelectDropdownMydsFix {
  peringkatKeselamatan: string[]
  selectedPeringkatKeselamatan: string
  setSelectedPeringkatKeselamatan: (value: string) => void
}

export default function SelectDropdownMyds({
  peringkatKeselamatan,
  selectedPeringkatKeselamatan,
  setSelectedPeringkatKeselamatan,
}: SelectDropdownMydsFix) {
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
          <SelectItem key={peringkat} value={peringkat}>
            {peringkat}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
