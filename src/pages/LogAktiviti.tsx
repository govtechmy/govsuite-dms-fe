import MainHeading from '@/components/layout/MainHeading'
import SearchBarCarianLogAktiviti from '@/components/page/CarianLogAktiviti/SearchBarCarianLogAktiviti'
import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import CarianLogAktiviti from '@/components/page/CarianLogAktiviti/CarianLogAktiviti'
import {
  BukaDokumenIcon,
  TambahPenggunaIcon,
  BuangAkuanPenggunaIcon,
  LogMasukIcon,
  LogKeluarIcon,
  MuatNaikDokumenIcon,
  LulusDokumenIcon,
  TakLulusDokumenIcon,
} from '@/assets/Icons/LogAktivitiIcon'
import { useSearchParams } from 'react-router-dom'

interface LogItem {
  id: string
  nama: string
  email: string
  aksi: string
  sasaran?: string
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
    sasaran: 'Muhammad Saiful Bin Bahri (m.saiful@digital.gov.my)',
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
    sasaran: 'Suhairi Bin Ibrahim (suha@digital.gov.my)',
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
    sasaran: 'Suhairi Bin Ibrahim (suha@digital.gov.my)',
    tarikh: '02/01/2026 04:45 PM',
    selangMasa: '1 hari lalu',
    jenis: 'Tambah Akaun',
  },
]

export default function LogAktiviti() {
  const [searchParams] = useSearchParams()
  const filterJenis = searchParams.get('jenis') || ''

  const filteredLogs = mockLogs.filter((log) => {
    if (!filterJenis || filterJenis === 'semua') return true
    return log.jenis.toLowerCase() === filterJenis.toLowerCase()
  })

  const renderIcon = (jenis: string) => {
    switch (jenis) {
      case 'Buka Dokumen':
        return <BukaDokumenIcon />
      case 'Log Masuk':
        return <LogMasukIcon />
      case 'Log Keluar':
        return <LogKeluarIcon />
      case 'Tambah Akaun':
        return <TambahPenggunaIcon />
      case 'Buang Akaun':
        return <BuangAkuanPenggunaIcon />
      case 'Muat Naik Dokumen':
        return <MuatNaikDokumenIcon />
      case 'Meluluskan Dokumen':
        return <LulusDokumenIcon />
      case 'Tidak Meluluskan Dokumen':
        return <TakLulusDokumenIcon />
      default:
    }
  }

  return (
    <RightSidePageLayoutWrapper className="h-full">
      <div className="flex h-full flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex gap-3 items-center">
            <MainHeading>Log Aktiviti</MainHeading>
          </div>
          <SearchBarCarianLogAktiviti />
          <CarianLogAktiviti />
        </div>
        <div className="flex flex-col gap-4">
          {filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-4 p-1">
              <div className="flex-shrink-0">{renderIcon(log.jenis)}</div>
              <div className="flex flex-col gap-0.5 text-[14px]">
                <div className="text-txt-black-700 leading-relaxed">
                  <span className="font-semibold text-txt-black-900">{log.nama}</span>{' '}
                  <span className="text-txt-black-400 font-normal">({log.email})</span>{' '}
                  <span className="text-txt-black-600">{log.aksi}</span>{' '}
                  {log.sasaran && (
                    <span className="font-semibold text-txt-black-900">{log.sasaran}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-txt-black-400 font-normal">
                  <span>{log.tarikh}</span>
                  <span>({log.selangMasa})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RightSidePageLayoutWrapper>
  )
}
