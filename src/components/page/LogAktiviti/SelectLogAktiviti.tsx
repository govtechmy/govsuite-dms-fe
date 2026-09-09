import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/SelectMydsFix'
import type { DropdownJenisDokumen } from '@/services/dropdown.svc'
import { Button } from '@govtechmy/myds-react/button'
import { DateRangePicker } from '@govtechmy/myds-react/daterange-picker'
import { DownloadIcon, ReloadIcon } from '@govtechmy/myds-react/icon'
import { useSearchParams } from 'react-router-dom'

interface SelectCarianDokumenProps {
  dropdownJenisDokumen: DropdownJenisDokumen[]
  dropdownYears?: string[]
  showOnlyWhenSearchQuery?: boolean
  resetPageOnFilterChange?: boolean
}

export default function SelectLogAktiviti({
  dropdownJenisDokumen,
  dropdownYears = [],
  showOnlyWhenSearchQuery = false,
  resetPageOnFilterChange = true,
}: SelectCarianDokumenProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const hasSearchQuery = Boolean(searchParams.get('search')?.trim())

  const selectedJenisDokumen = searchParams.get('jenisDokumen') || ''
  const selectedYear = searchParams.get('year') || ''
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

  const handleYearChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'semua') {
      params.set('year', value)
    } else {
      params.delete('year')
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
    params.delete('year')
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
    <div className="flex flex-wrap justify-between items-start gap-2">
      <div className="flex flex-row flex-wrap gap-2">
        {dropdownYears.length > 0 && (
          <Select
            size={'small'}
            variant="outline"
            value={selectedYear}
            onValueChange={handleYearChange}
          >
            <SelectTrigger>
              <SelectValue label="Tahun" placeholder="Semua" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua</SelectItem>
              {dropdownYears.map((yearValue) => (
                <SelectItem key={yearValue} value={yearValue}>
                  {yearValue}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          size={'small'}
          variant="outline"
          value={selectedJenisDokumen}
          onValueChange={handleJenisDokumenChange}
        >
          <SelectTrigger>
            <SelectValue label="Jenis" placeholder="Semua" />
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

        <div className="flex flex-wrap items-center gap-1.5">
          <DateRangePicker
            locale="ms"
            formatStr="dd MMMM yyy"
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
        <Button variant="default-outline" onClick={handleReset}>
          <ReloadIcon />
          <div>Set Semula</div>
        </Button>
      </div>
      <Button size={'small'}>
        <DownloadIcon />
        Muat Turun Log
      </Button>
    </div>
  )
}
