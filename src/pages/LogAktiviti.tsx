import MainHeading from '@/components/layout/MainHeading'
import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import LogAktivitiIcon from '@/components/page/LogAktiviti/LogAktivitiIcon'

interface LogItem {
  id: string
  nama: string
  email: string
  aksi: string
  sasaran?: string
  sasaranEmel?: string
  tarikh: string
  selangMasa: string
  jenis: string
}

const mockLogs: LogItem[] = [
  {
    id: '1',
    nama: 'Mohd Muzakkir Zamani Bin Fairuzzaki',
    email: 'muzakkir@digital.gov.my',
    aksi: 'telah membuka dokumen',
    sasaran: 'Minit Mesyuarat JKPPN (Januari 2026)',
    tarikh: '04/01/2026 09:00 AM',
    selangMasa: '1 minit lalu',
    jenis: 'Buka Dokumen',
  },
  {
    id: '2',
    nama: 'Wong Chi Han',
    email: 'wongch@digital.gov.my',
    aksi: 'telah log masuk.',
    tarikh: '04/01/2026 08:00 AM',
    selangMasa: '1 jam lalu',
    jenis: 'Log Masuk',
  },
  {
    id: '3',
    nama: 'Wong Chi Han',
    email: 'wongch@digital.gov.my',
    aksi: 'telah log keluar.',
    tarikh: '03/01/2026 06:00 PM',
    selangMasa: '8 jam lalu',
    jenis: 'Log Keluar',
  },
  {
    id: '4',
    nama: 'Muhammad Aidan Aris Bin Saiful Bukhary',
    email: 'm.aidan@digital.gov.my',
    aksi: 'telah membuang akaun pengguna',
    sasaran: 'Muhammad Saiful Bin Bahri',
    sasaranEmel: 'm.saiful@digital.gov.my',
    tarikh: '03/01/2026 05:00 PM',
    selangMasa: '9 jam lalu',
    jenis: 'Buang Akaun',
  },
  {
    id: '5',
    nama: 'Mohd Muzakkir Zamani Bin Fairuzzaki',
    email: 'muzakkir@digital.gov.my',
    aksi: 'telah meluluskan dokumen',
    sasaran: 'Minit Mesyuarat JKPPN (Januari 2026)',
    tarikh: '02/01/2026 04:45 PM',
    selangMasa: '1 hari lalu',
    jenis: 'Meluluskan Dokumen',
  },
  {
    id: '6',
    nama: 'Mohd Muzakkir Zamani Bin Fairuzzaki',
    email: 'muzakkir@digital.gov.my',
    aksi: 'telah memuat naik dokumen',
    sasaran: 'Minit Mesyuarat JKPPN (Januari 2026)',
    tarikh: '02/01/2026 04:45 PM',
    selangMasa: '1 hari lalu',
    jenis: 'Muat Naik Dokumen',
  },
  {
    id: '7',
    nama: 'Mohd Muzakkir Zamani Bin Fairuzzaki',
    email: 'muzakkir@digital.gov.my',
    aksi: 'telah tidak meluluskan dokumen',
    sasaran: 'Minit Mesyuarat JPICT (Disember 2024)',
    tarikh: '02/01/2026 04:45 PM',
    selangMasa: '1 hari lalu',
    jenis: 'Tidak Meluluskan Dokumen',
  },
  {
    id: '8',
    nama: 'Muhammad Aidan Aris Bin Saiful Bukhary',
    email: 'm.aidan@digital.gov.my',
    aksi: 'telah menambah akaun pengguna',
    sasaran: 'Suhairi Bin Ibrahim',
    sasaranEmel: 'suha@digital.gov.my',
    tarikh: '02/01/2026 04:45 PM',
    selangMasa: '1 hari lalu',
    jenis: 'Tambah Akaun',
  },
  {
    id: '9',
    nama: 'Mohd Muzakkir Zamani Bin Fairuzzaki',
    email: 'muzakkir@digital.gov.my',
    aksi: 'telah meluluskan dokumen',
    sasaran: 'Minit Mesyuarat JKPPN (Januari 2026)',
    tarikh: '02/01/2026 04:45 PM',
    selangMasa: '1 hari lalu',
    jenis: 'Meluluskan Dokumen',
  },
  {
    id: '10',
    nama: 'Mohd Muzakkir Zamani Bin Fairuzzaki',
    email: 'muzakkir@digital.gov.my',
    aksi: 'telah memuat naik dokumen',
    sasaran: 'Minit Mesyuarat JKPPN (Januari 2026)',
    tarikh: '02/01/2026 04:45 PM',
    selangMasa: '1 hari lalu',
    jenis: 'Muat Naik Dokumen',
  },
  {
    id: '11',
    nama: 'Mohd Muzakkir Zamani Bin Fairuzzaki',
    email: 'muzakkir@digital.gov.my',
    aksi: 'telah tidak meluluskan dokumen',
    sasaran: 'Minit Mesyuarat JKPPN (Januari 2026)',
    tarikh: '02/01/2026 04:45 PM',
    selangMasa: '1 hari lalu',
    jenis: 'Tidak Meluluskan Dokumen',
  },
  {
    id: '12',
    nama: 'Muhammad Aidan Aris Bin Saiful Bukhary',
    email: 'm.aidan@digital.gov.my',
    aksi: 'telah menambah akaun pengguna',
    sasaran: 'Suhairi Bin Ibrahim',
    sasaranEmel: 'suha@digital.gov.my',
    tarikh: '02/01/2026 04:45 PM',
    selangMasa: '1 hari lalu',
    jenis: 'Tambah Akaun',
  },
]

export default function LogAktiviti() {
  return (
    <RightSidePageLayoutWrapper className="flex min-h-screen flex-col">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex gap-3 items-center">
          <MainHeading>Log Aktiviti</MainHeading>
        </div>
        {mockLogs.map((log, index) => (
          <div key={log.id} className="flex items-start gap-4">
            <div className="flex flex-col items-center pt-1">
              <LogAktivitiIcon jenis={log.jenis} />

              {index !== mockLogs.length - 1 && <div className="mt-2 h-6 w-px bg-otl-gray-200" />}
            </div>
            <div className="flex-1 min-w-0 w-full whitespace-nowrap ">
              <div className="text-sm leading-relaxed">
                <span className="font-semibold text-txt-black-900">{log.nama}</span>{' '}
                <span className="text-txt-black-400 font-normal">({log.email})</span>{' '}
                <span className="text-txt-black-600">{log.aksi}</span>{' '}
                {log.sasaran && (
                  <span className="font-semibold text-txt-black-900">
                    {log.sasaran}
                    {log.sasaranEmel && (
                      <span className="font-normal text-txt-black-400"> ({log.sasaranEmel})</span>
                    )}
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-xs text-txt-black-400 font-normal">
                  <span>{log.tarikh}</span>
                  <span>({log.selangMasa})</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </RightSidePageLayoutWrapper>
  )
}
