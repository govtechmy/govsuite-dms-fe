import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../shared/SelectMydsFix";

export default function RingkasanEksekutif({ Tahun }: { Tahun: string[] }) {
  return (
    <div >
      <h1 className="text-heading-3xs font-heading font-semibold">Selamat Datang,</h1>
      <p className="text-body-md font-normal text-XL-400 mb-4">
        Mohd Muzakkir Zamani Bin Fairuzzaki
      </p>
      <div className="text-body-md font-semibold text-txt-black-900">Ringkasan Eksekutif</div>
      <div className="flex justify-between items-center mb-3">
      <div className="text-body-sm font-normal text-txt-black-500 pt-1 pb-3">
        Berikut adalah status dokumen terkini.
      </div>
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
      
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 w-full">
  
  {/* KAD 1: Jumlah Dokumen */}
  <a 
  href="ms/katalog-dokumen"
  className="relative overflow-hidden bg-bg-primary-50 border-l-[10px] border-l-primary-200 rounded-lg h-[108px] w-full flex flex-col justify-center items-center gap-3">
  <div className="text-5xl font-semibold text-txt-black-900">
    821
  </div>
  <div className="text-body-m font-medium text-txt-black-700">
    Jumlah Dokumen
  </div>
</a>

  {/* KAD 2: Perlukan Kelulusan */}
  <div className="relative overflow-hidden bg-bg-warning-50 border-l-[10px] border-l-bg-warning-200 rounded-lg h-[108px] w-full flex flex-col justify-center items-center gap-3">
    <div className="text-5xl font-semibold text-txt-black-900">
      42
    </div>
    <div className="text-body-m font-medium text-txt-black-700">
      Perlukan Kelulusan
    </div>
  </div>

  {/* KAD 3: Dokumen Ditolak */}
  <div className="relative overflow-hidden bg-bg-danger-50 border-l-[10px] border-l-bg-danger-200 rounded-lg h-[108px] w-full flex flex-col justify-center items-center gap-3">
    <div className="text-5xl font-semibold text-txt-black-900">
      10
    </div>
    <div className="text-body-m font-medium text-txt-black-700">
      Dokumen Ditolak
    </div>
  </div>

</div>
    </div>
    )
    }