import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/SelectMydsFix'
import SimpleBarChart from '@/components/shared/SimpleBarChart'

interface TrendKekerapanDokumenProps {
  unit: string[]
  data: Array<{
    name: string
    value: number
  }>
}

export default function TrendKekerapanDokumen({ unit, data }: TrendKekerapanDokumenProps) {
  return (
    <div>
      <div className="text-body-md font-semibold text-txt-black-900">Trend Kekerapan Dokumen</div>
      <div className="text-body-sm font-normal text-txt-black-500 pt-1 pb-3">
        Memaparkan 5 dokumen paling popular bagi unit ini.
      </div>
      <div className="flex justify-between items-center mb-3">
        <div className="text-body-sm font-normal text-txt-black-500">Data sehingga Mei 2026</div>
        <Select size={'small'} variant="outline">
          <SelectTrigger>
            <SelectValue label="Unit" placeholder="Semua" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua</SelectItem>
            {unit.map((unitName) => (
              <SelectItem key={unitName} value={unitName}>
                {unitName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <SimpleBarChart data={data} />
    </div>
  )
}
