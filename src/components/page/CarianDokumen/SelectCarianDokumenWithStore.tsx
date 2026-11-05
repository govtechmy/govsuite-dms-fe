import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/SelectMydsFix'
import { Button } from '@govtechmy/myds-react/button'
import { DatePicker } from '@govtechmy/myds-react/date-picker'
import { CrossIcon, ReloadIcon } from '@govtechmy/myds-react/icon'
import { Tooltip, TooltipContent, TooltipTrigger } from '@govtechmy/myds-react/tooltip'
import { useSearchStore } from '@/store/SearchStore'
import { useSearchParams } from 'react-router-dom'
import { SEARCH_MODE, SEARCH_MODE_PARAM } from './searchMode'

interface SelectCarianDokumenWithStoreProps {
  showOnlyWhenSearchQuery?: boolean
  resetPageOnFilterChange?: boolean
}

const SEARCH_LIMIT = '10'
const DATE_FORMAT = 'dd/MM/yyyy'

export default function SelectCarianDokumenWithStore({
  showOnlyWhenSearchQuery = false,
  resetPageOnFilterChange = true,
}: SelectCarianDokumenWithStoreProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const dropdownUnits = useSearchStore((state) => state.dropdownUnits)
  const dropdownJenisDokumen = useSearchStore((state) => state.dropdownJenisDokumen)
  const setJenisDokumen = useSearchStore((state) => state.setJenisDokumen)
  const setUnit = useSearchStore((state) => state.setUnit)
  const setDateRange = useSearchStore((state) => state.setDateRange)
  const hasSearchQuery = Boolean(searchParams.get('search')?.trim())

  const selectedJenisDokumen = searchParams.get('jenisDokumen') || ''
  const selectedUnit = searchParams.get('unit') || ''
  const dateFrom = searchParams.get('dateFrom') || ''
  const dateTo = searchParams.get('dateTo') || ''
  const selectedSearchMode =
    searchParams.get(SEARCH_MODE_PARAM) === SEARCH_MODE.HIBRID ? SEARCH_MODE.HIBRID : ''

  // View only: the search request stays the same, so the page is not reset
  const handleSearchModeChange = (value: string) => {
    const params = new URLSearchParams(searchParams)

    if (value === SEARCH_MODE.HIBRID) {
      params.set(SEARCH_MODE_PARAM, SEARCH_MODE.HIBRID)
    } else {
      params.delete(SEARCH_MODE_PARAM)
    }

    setSearchParams(params)
  }

  const handleJenisDokumenChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    const normalizedValue = value && value !== 'semua' ? value : ''

    if (normalizedValue) {
      params.set('jenisDokumen', normalizedValue)
    } else {
      params.delete('jenisDokumen')
    }

    if (resetPageOnFilterChange) {
      params.set('page', '1')
      params.set('limit', SEARCH_LIMIT)
    }

    setJenisDokumen(normalizedValue)
    setSearchParams(params)
  }

  const handleUnitChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    const normalizedValue = value && value !== 'semua' ? value : ''

    if (normalizedValue) {
      params.set('unit', normalizedValue)
    } else {
      params.delete('unit')
    }

    if (resetPageOnFilterChange) {
      params.set('page', '1')
      params.set('limit', SEARCH_LIMIT)
    }

    setUnit(normalizedValue)
    setSearchParams(params)
  }

  const handleDateRangeChange = (from: Date | null, to: Date | null) => {
    const params = new URLSearchParams(searchParams)
    const nextDateFrom = from ? from.toISOString() : ''
    const nextDateTo = to ? to.toISOString() : ''

    if (nextDateFrom) {
      params.set('dateFrom', nextDateFrom)
    } else {
      params.delete('dateFrom')
    }

    if (nextDateTo) {
      params.set('dateTo', nextDateTo)
    } else {
      params.delete('dateTo')
    }

    if (resetPageOnFilterChange) {
      params.set('page', '1')
      params.set('limit', SEARCH_LIMIT)
    }

    setDateRange(nextDateFrom, nextDateTo)
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
      params.set('limit', SEARCH_LIMIT)
    }

    setUnit('')
    setJenisDokumen('')
    setDateRange('', '')
    setSearchParams(params)
  }

  if (showOnlyWhenSearchQuery && !hasSearchQuery) {
    return <div className="flex justify-between items-start" />
  }

  const dateFromValue = dateFrom ? new Date(dateFrom) : undefined
  const dateToValue = dateTo ? new Date(dateTo) : undefined

  return (
    <div className="flex flex-wrap justify-between items-start gap-2">
      <div className="flex flex-row flex-wrap gap-2">
        <Select
          size={'small'}
          variant="outline"
          value={selectedSearchMode}
          onValueChange={handleSearchModeChange}
        >
          <SelectTrigger>
            <SelectValue label="Jenis Carian" placeholder="Teks Penuh" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SEARCH_MODE.TEKS}>Teks Penuh</SelectItem>
            <SelectItem value={SEARCH_MODE.HIBRID}>Hibrid</SelectItem>
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

        <div className="flex flex-wrap items-center gap-1.5">
          {/* DatePicker keeps its own value when given undefined, so remount it to clear. */}
          <DatePicker
            key={`dari-${dateFrom}`}
            locale="ms"
            size="small"
            formatStr={`'Dari:' ${DATE_FORMAT}`}
            placeholder="Dari: Pilih Tarikh"
            value={dateFromValue}
            disabled={dateToValue ? { after: dateToValue } : undefined}
            onValueChange={(date) => handleDateRangeChange(date, dateToValue ?? null)}
          />
          <span className="text-body-sm text-txt-black-500" aria-hidden="true">
            -
          </span>
          <DatePicker
            key={`hingga-${dateTo}`}
            locale="ms"
            size="small"
            formatStr={`'Hingga:' ${DATE_FORMAT}`}
            placeholder="Hingga: Pilih Tarikh"
            value={dateToValue}
            disabled={dateFromValue ? { before: dateFromValue } : undefined}
            onValueChange={(date) => handleDateRangeChange(dateFromValue ?? null, date)}
          />
          {(dateFrom || dateTo) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default-outline"
                  size="small"
                  iconOnly
                  aria-label="Kosongkan tarikh"
                  onClick={() => handleDateRangeChange(null, null)}
                >
                  <CrossIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Kosongkan Tarikh</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="default-outline"
            size="small"
            iconOnly
            aria-label="Set semula"
            className="shrink-0"
            onClick={handleReset}
          >
            <ReloadIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Set Semula</TooltipContent>
      </Tooltip>
    </div>
  )
}
