import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/SelectMydsFix'

export default function SelectKatalogDokumen() {
  const unit = ['Unit A', 'Unit B']
  const jenisDokumen = ['Minit Mesyuarat', 'Minit Mesyuarat2']
  return (
    <div className="flex gap-1">
      <Select size={'small'} variant="outline">
        <SelectTrigger>
          <SelectValue label="Unit" placeholder="Semua" />
        </SelectTrigger>
        <SelectContent>
          {unit.map((unitValue) => (
            <SelectItem key={unitValue} value={unitValue}>
              {unitValue}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select size={'small'} variant="outline">
        <SelectTrigger>
          <SelectValue label="Jenis Dokumen" placeholder="Semua" />
        </SelectTrigger>
        <SelectContent>
          {jenisDokumen.map((jenisDokumenValue) => (
            <SelectItem key={jenisDokumenValue} value={jenisDokumenValue}>
              {jenisDokumenValue}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
