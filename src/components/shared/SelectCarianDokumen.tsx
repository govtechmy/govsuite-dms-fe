import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/SelectMydsFix'
import type { DropdownJenisDokumen, DropdownUnit } from '@/services/catalog.svc'
import { Button } from '@govtechmy/myds-react/button'
import { DateRangePicker } from '@govtechmy/myds-react/daterange-picker'
import { ReloadIcon } from '@govtechmy/myds-react/icon'
import { useSearchParams } from 'react-router-dom'

interface SelectCarianDokumenProps {
  dropdownUnits: DropdownUnit[]
  dropdownJenisDokumen: DropdownJenisDokumen[]
  showOnlyWhenSearchQuery?: boolean
  resetPageOnFilterChange?: boolean
}

export default function SelectCarianDokumen({
  dropdownUnits,
  dropdownJenisDokumen,
  showOnlyWhenSearchQuery = false,
  resetPageOnFilterChange = true,
}: SelectCarianDokumenProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const hasSearchQuery = Boolean(searchParams.get('search')?.trim())

  const selectedJenisDokumen = searchParams.get('jenisDokumen') || ''
  const selectedUnit = searchParams.get('unit') || ''
  const dateFrom = searchParams.get('dateFrom') || ''
  const dateTo = searchParams.get('dateTo') || ''

  const handleJenisDokumenChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'semua') {
      params.set('jenisDokumen', value)
    } else {
      params.delete('jenisDokumen')
    }
    if (resetPageOnFilterChange) {
      params.set('page', '1')
    }
    setSearchParams(params)
  }

  const handleUnitChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'semua') {
      params.set('unit', value)
    } else {
      params.delete('unit')
    }
    if (resetPageOnFilterChange) {
      params.set('page', '1')
    }
    setSearchParams(params)
  }

  const handleDateRangeChange = (from: Date | null, to: Date | null) => {
    const params = new URLSearchParams(searchParams)
    if (from) {
      params.set('dateFrom', from.toISOString())
    } else {
      params.delete('dateFrom')
    }
    if (to) {
      params.set('dateTo', to.toISOString())
    } else {
      params.delete('dateTo')
    }
    if (resetPageOnFilterChange) {
      params.set('page', '1')
    }
    setSearchParams(params)
  }

  const handleReset = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('jenisDokumen')
    params.delete('unit')
    params.delete('dateFrom')
    params.delete('dateTo')
    if (resetPageOnFilterChange) {
      params.set('page', '1')
    }
    setSearchParams(params)
  }

  if (showOnlyWhenSearchQuery && !hasSearchQuery) {
    return <div className="flex justify-between items-start" />
  }

  return (
    <div className="flex justify-between items-start">
      <div className="flex flex-row flex-wrap gap-2">
        <Select
          size={'small'}
          variant="outline"
          value={selectedUnit}
          onValueChange={handleUnitChange}
        >
          <SelectTrigger>
            <SelectValue label="Unit" placeholder="Semua" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua</SelectItem>
            {dropdownUnits.map((unitValue) => (
              <SelectItem key={unitValue.code} value={unitValue.code}>
                {unitValue.codeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          size={'small'}
          variant="outline"
          value={selectedJenisDokumen}
          onValueChange={handleJenisDokumenChange}
        >
          <SelectTrigger>
            <SelectValue label="Jenis Dokumen" placeholder="Semua" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua</SelectItem>
            {dropdownJenisDokumen.map((jenisDokumenValue) => (
              <SelectItem key={jenisDokumenValue.id} value={jenisDokumenValue.code}>
                {jenisDokumenValue.codeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1.5">
          <DateRangePicker
            locale="ms"
            placeholder="Pilih Tarikh"
            value={{
              from: dateFrom ? new Date(dateFrom) : undefined,
              to: dateTo ? new Date(dateTo) : undefined,
            }}
            onValueChange={(range) => handleDateRangeChange(range.from ?? null, range.to ?? null)}
          />
          {(dateFrom || dateTo) && (
            <Button
              variant="default-outline"
              size="small"
              onClick={() => handleDateRangeChange(null, null)}
            >
              Kosongkan Tarikh
            </Button>
          )}
        </div>
      </div>
      <div className="w-[126px] shrink-0">
        <Button variant="default-outline" className="w-full gap-2" onClick={handleReset}>
          <ReloadIcon />
          <div>Set Semula</div>
        </Button>
      </div>
    </div>
  )
}
