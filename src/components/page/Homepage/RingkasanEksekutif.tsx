import { RingkasanEksekutifCard } from '@/components/shared/RingkasanEksekutifCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/SelectMydsFix'
import { useAuthStore } from '@/store/AuthStore'
import { useNavigate, useParams } from 'react-router-dom'

interface RingkasanEksekutifCardInfo {
  jumlahDokumen: number | string
  perlukanKelulusan: number | string
  dokumenTidakDiluluskan: number | string
  dokumenDraf: number | string
  dokumenDiluluskan: number | string
}

interface RingkasanEksekutifProps {
  yearOptions: Array<string | number>
  selectedYear: string
  onYearChange: (value: string) => void
  cardInfo: RingkasanEksekutifCardInfo
}

export default function RingkasanEksekutif({
  cardInfo,
  yearOptions,
  selectedYear,
  onYearChange,
}: RingkasanEksekutifProps) {
  const navigate = useNavigate()
  const { lang } = useParams<{ lang: string }>()
  const fullName = useAuthStore((state) => state.user?.fullName ?? '')

  const navigateWithSelectedYear = (path: string) => {
    const normalizedYear = selectedYear.trim().toLowerCase()

    if (normalizedYear === 'all' || normalizedYear === 'semua') {
      navigate(`/${lang}/${path}`)
      return
    }

    const params = new URLSearchParams({
      year: selectedYear,
      page: '1',
    })

    navigate(`/${lang}/${path}?${params.toString()}`)
  }

  return (
    <div>
      <h1 className="text-heading-3xs font-heading font-semibold">Selamat Datang,</h1>
      <p className="text-body-md font-normal text-XL-400 mb-4">{fullName}</p>
      <div className="text-body-md font-semibold text-txt-black-900">Ringkasan Eksekutif</div>

      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <div className="text-body-sm font-normal text-txt-black-500 pt-1 pb-3">
          Berikut adalah status dokumen terkini.
        </div>

        <div className="">
          <Select
            size={'small'}
            variant="outline"
            value={selectedYear}
            onValueChange={onYearChange}
          >
            <SelectTrigger>
              <SelectValue label="Tahun" placeholder="Semua" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((yearValue) => (
                <SelectItem key={String(yearValue)} value={String(yearValue)}>
                  {String(yearValue) === 'all' ? 'Semua' : String(yearValue)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 w-full">
        <RingkasanEksekutifCard
          key="jumlah-dokumen"
          label="Jumlah Dokumen"
          value={cardInfo.jumlahDokumen}
          variant="primary"
          onClick={() => {
            navigateWithSelectedYear('katalog-dokumen')
          }}
        />
        <RingkasanEksekutifCard
          key="perlukan-kelulusan"
          label="Perlukan Kelulusan"
          value={cardInfo.perlukanKelulusan}
          variant="warning"
          onClick={() => {
            navigateWithSelectedYear('perlu-kelulusan')
          }}
        />
        <RingkasanEksekutifCard
          key="dokumen-tidak-diluluskan"
          label="Dokumen tidak diluluskan"
          value={cardInfo.dokumenTidakDiluluskan}
          variant="danger"
          onClick={() => {
            navigateWithSelectedYear('tidak-lulus')
          }}
        />
        <RingkasanEksekutifCard
          key="dokumen-draf"
          label="Dokumen Draf"
          value={cardInfo.dokumenDraf}
          variant="default"
          onClick={() => {
            navigateWithSelectedYear('draf')
          }}
        />
        <RingkasanEksekutifCard
          key="dokumen-diluluskan"
          label="Dokumen Diluluskan"
          value={cardInfo.dokumenDiluluskan}
          variant="success"
          onClick={() => {
            navigateWithSelectedYear('diluluskan')
          }}
        />
      </div>
    </div>
  )
}
