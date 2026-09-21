import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/SelectMydsFix'
import type { DropdownLogCategory } from '@/services/dropdown.svc'
import { Button } from '@govtechmy/myds-react/button'
import { DateRangePicker } from '@govtechmy/myds-react/daterange-picker'
import { DownloadIcon, ReloadIcon } from '@govtechmy/myds-react/icon'
import { useSearchParams } from 'react-router-dom'

interface SelectCarianDokumenProps {
  dropdownCategories?: DropdownLogCategory[]
  dropdownYears?: string[]
  showOnlyWhenSearchQuery?: boolean
  resetPageOnFilterChange?: boolean
  onDownload?: () => void
  isDownloading?: boolean
}

export default function SelectLogAktiviti({
  dropdownCategories = [],
  dropdownYears = [],
  showOnlyWhenSearchQuery = false,
  resetPageOnFilterChange = true,
  onDownload,
  isDownloading = false,
}: SelectCarianDokumenProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const hasSearchQuery = Boolean(searchParams.get('search')?.trim())

  const selectedCategory = searchParams.get('category') || ''
  const selectedYear = searchParams.get('year') || ''
  const dateFrom = searchParams.get('dateFrom') || ''
  const dateTo = searchParams.get('dateTo') || ''

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'semua') {
      params.set('category', value)
    } else {
      params.delete('category')
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
    params.delete('category')
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

        {dropdownCategories.length > 0 && (
          <Select
            size={'small'}
            variant="outline"
            value={selectedCategory}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger>
              <SelectValue label="Jenis" placeholder="Semua" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua</SelectItem>
              {dropdownCategories.map((categoryValue) => (
                <SelectItem key={categoryValue.code} value={categoryValue.code}>
                  {categoryValue.codeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

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
      <Button size={'small'} onClick={onDownload} disabled={isDownloading}>
        <DownloadIcon />
        {isDownloading ? 'Memuat Turun...' : 'Muat Turun Log'}
      </Button>
    </div>
  )
}
