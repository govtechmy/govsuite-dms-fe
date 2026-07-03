import React from 'react'
// Simple inline fallback icon for download
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 3v10.586l3.293-3.293 1.414 1.414L12 17.414 7.293 12.707l1.414-1.414L11 13.586V3h1z" />
    <path d="M5 20h14v2H5z" />
  </svg>
)
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/SelectMydsFix'
import { Button } from '@govtechmy/myds-react/button'
import { DateRangePicker } from '@govtechmy/myds-react/daterange-picker'
import { ReloadIcon } from '@govtechmy/myds-react/icon'
import { useSearchParams } from 'react-router-dom'

export default function SelectCarianLogAktiviti() {
  const [searchParams, setSearchParams] = useSearchParams()
  const jenis = [
    'Buka Dokumen',
    'Log Masuk',
    'Log Keluar',
    'Muat Naik Dokumen',
    'Muat Turun Dokumen',
    'Tambah Akaun',
    'Buang Akaun',
    'Cipta Folder',
    'Meluluskan Dokumen',
    'Tidak Meluluskan Dokumen',
  ]

  const selectedJenis = searchParams.get('jenis') || ''
  const dateFrom = searchParams.get('dateFrom') || ''
  const dateTo = searchParams.get('dateTo') || ''

  const handleJenisChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'semua') {
      params.set('jenis', value)
    } else {
      params.delete('jenis')
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
    setSearchParams(params)
  }

  const handleReset = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('jenis')
    params.delete('dateFrom')
    params.delete('dateTo')
    setSearchParams(params)
  }

  return (
    <div className="flex justify-between ">
      <div className="flex gap-1">
        <Select
          size={'small'}
          variant="outline"
          value={selectedJenis}
          onValueChange={handleJenisChange}
        >
          <SelectTrigger>
            <SelectValue label="Jenis" placeholder="Semua" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua</SelectItem>
            {jenis.map((jenisValue) => (
              <SelectItem key={jenisValue} value={jenisValue}>
                {jenisValue}
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
          <Button variant="default-outline" size="small" onClick={handleReset}>
            <ReloadIcon />
            <div>Set Semula</div>
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-center bg-primary-500 rounded-sm px-1.5 py-1 gap-0.5">
        <DownloadIcon className="size-4" />
        <p className="text-body-sm font-medium text-white">Muat Turun Log</p>
      </div>
    </div>
  )
}
