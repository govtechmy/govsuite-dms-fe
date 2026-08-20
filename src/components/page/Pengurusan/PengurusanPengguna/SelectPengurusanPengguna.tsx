import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/SelectMydsFix'
import type { DropdownUnit, DropdownUserRole } from '@/services/dropdown.svc'
// import type { AccessLevel } from '@/services/dropdown.svc'
import { Button } from '@govtechmy/myds-react/button'
import { PlusIcon, ReloadIcon } from '@govtechmy/myds-react/icon'
import { useSearchParams } from 'react-router-dom'

interface SelectPengurusanPenggunaProps {
  dropdownUnits: DropdownUnit[]
  dropdownTahapAkses: DropdownUserRole[]
  // Tahap Keselamatan lookup endpoint isn't released yet — re-enable once backend is ready.
  // dropdownTahapKeselamatan: AccessLevel[]
  showOnlyWhenSearchQuery?: boolean
  resetPageOnFilterChange?: boolean
}

export default function SelectPengurusanPengguna({
  dropdownUnits,
  dropdownTahapAkses,
  // dropdownTahapKeselamatan,
  showOnlyWhenSearchQuery = false,
  resetPageOnFilterChange = true,
}: SelectPengurusanPenggunaProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const hasSearchQuery = Boolean(searchParams.get('search')?.trim())

  const selectedUnit = searchParams.get('unit') || ''
  const selectedTahapAkses = searchParams.get('tahapAkses') || ''
  // const selectedTahapKeselamatan = parseListParam(searchParams.get('tahapKeselamatan'))

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

  const handleTahapAksesChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'semua') {
      params.set('tahapAkses', value)
    } else {
      params.delete('tahapAkses')
    }
    if (resetPageOnFilterChange) {
      params.set('page', '1')
    }
    setSearchParams(params)
  }

  // const handleTahapKeselamatanChange = (values: string[]) => {
  //   const params = new URLSearchParams(searchParams)
  //   if (values.length > 0) {
  //     params.set('tahapKeselamatan', values.join(','))
  //   } else {
  //     params.delete('tahapKeselamatan')
  //   }
  //   if (resetPageOnFilterChange) {
  //     params.set('page', '1')
  //   }
  //   setSearchParams(params)
  // }

  const handleReset = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('unit')
    params.delete('tahapAkses')
    params.delete('tahapKeselamatan')
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
          value={selectedTahapAkses}
          onValueChange={handleTahapAksesChange}
        >
          <SelectTrigger>
            <SelectValue label="Peranan Pengguna" placeholder="Semua" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua</SelectItem>
            {dropdownTahapAkses.map((role) => (
              <SelectItem key={role.code} value={role.code}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tahap Keselamatan lookup endpoint isn't released yet — re-enable once backend is ready.
        <Select
          size={'small'}
          variant="outline"
          multiple
          value={selectedTahapKeselamatan}
          onValueChange={handleTahapKeselamatanChange}
        >
          <SelectTrigger>
            <SelectValue label="Tahap Keselamatan" placeholder="Semua" />
          </SelectTrigger>
          <SelectContent>
            {dropdownTahapKeselamatan.map((accessLevel) => (
              <SelectItem key={accessLevel.id} value={accessLevel.code}>
                {accessLevel.codeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        */}
      </div>
      <div className="shrink-0 flex gap-2">
        <Button variant="default-outline" onClick={handleReset}>
          <ReloadIcon />
          <div>Set Semula</div>
        </Button>
        <Button>
          <PlusIcon /> Tambah Pengguna
        </Button>
      </div>
    </div>
  )
}
