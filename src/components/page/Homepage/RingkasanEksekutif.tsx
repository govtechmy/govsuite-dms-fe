import { RingkasanEksekutifCard } from '@/components/shared/RingkasanEksekutifCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/SelectMydsFix'
import { useNavigate, useParams } from 'react-router-dom'

interface RingkasanEksekutifCardInfo {
  jumlahDokumen: number | string
  perlukanKelulusan: number | string
  dokumenTidakDiluluskan: number | string
  dokumenDraf: number | string
}

interface RingkasanEksekutifProps {
  Tahun: string[]
  cardInfo: RingkasanEksekutifCardInfo
}

export default function RingkasanEksekutif({ cardInfo, Tahun }: RingkasanEksekutifProps) {
  const navigate = useNavigate()
  const { lang } = useParams<{ lang: string }>()

  return (
    <div>
      <h1 className="text-heading-3xs font-heading font-semibold">Selamat Datang,</h1>
      <p className="text-body-md font-normal text-XL-400 mb-4">
        Mohd Muzakkir Zamani Bin Fairuzzaki
      </p>
      <div className="text-body-md font-semibold text-txt-black-900">Ringkasan Eksekutif</div>

      <div className="flex justify-between items-center mb-3">
        <div className="text-body-sm font-normal text-txt-black-500 pt-1 pb-3">
          Berikut adalah status dokumen terkini.
        </div>

        {/* HIDDEN DUE TO CHANGE LATER IMPLEMENT YET */}
        <div className="hidden">
          <Select size={'small'} variant="outline">
            <SelectTrigger>
              <SelectValue label="Tahun" placeholder="2026" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tahun">2026</SelectItem>
              {Tahun.map((TahunValue) => (
                <SelectItem key={TahunValue} value={TahunValue}>
                  {TahunValue}
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
            navigate(`/${lang}/katalog-dokumen`)
          }}
        />
        <RingkasanEksekutifCard
          key="perlukan-kelulusan"
          label="Perlukan Kelulusan"
          value={cardInfo.perlukanKelulusan}
          variant="warning"
          onClick={() => {
            navigate(`/${lang}/perlu-kelulusan`)
          }}
        />
        <RingkasanEksekutifCard
          key="dokumen-tidak-diluluskan"
          label="Dokumen tidak diluluskan"
          value={cardInfo.dokumenTidakDiluluskan}
          variant="danger"
          onClick={() => {
            navigate(`/${lang}/tidak-lulus`)
          }}
        />
        <RingkasanEksekutifCard
          key="dokumen-draf"
          label="Dokumen Draf"
          value={cardInfo.dokumenDraf}
          variant="default"
          onClick={() => {
            navigate(`/${lang}/draf`)
          }}
        />
      </div>
    </div>
  )
}
