import PaginationControl from '@/components/shared/PaginationControl'
import { Callout, CalloutContent, CalloutTitle } from '@govtechmy/myds-react/callout'
import { Fragment } from 'react'
import LogAktivitiIconManager from './LogAktivitiIconManager'

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

interface LogDisplaySearchProps {
  pageNumber: number
  pageSize: number
  onPageChange: (newPage: number) => void
  onPageSizeChange: (newSize: number) => void
}

export default function LogDisplaySearch({
  pageNumber,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: LogDisplaySearchProps) {
  const totalRecords = mockLogs.length
  const startIndex = (pageNumber - 1) * pageSize
  const paginatedLogs = mockLogs.slice(startIndex, startIndex + pageSize)

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        {paginatedLogs.length > 0 ? (
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            {paginatedLogs.map((log, index) => {
              const isLast = index === paginatedLogs.length - 1

              return (
                <Fragment key={log.id}>
                  <div className="flex items-center">
                    <LogAktivitiIconManager jenis={log.jenis} />
                  </div>
                  <div className="flex-1 w-full">
                    <div className="text-sm">
                      <span className="font-semibold text-txt-black-900">{log.nama}</span>{' '}
                      <span className="text-txt-black-400 font-normal">({log.email})</span>{' '}
                      <span className="text-txt-black-600">{log.aksi}</span>{' '}
                      {log.sasaran && (
                        <span className="font-semibold text-txt-black-900">
                          {log.sasaran}
                          {log.sasaranEmel && (
                            <span className="font-normal text-txt-black-400">
                              {' '}
                              ({log.sasaranEmel})
                            </span>
                          )}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-txt-black-400 font-normal">
                        <span>{log.tarikh}</span>
                        <span>({log.selangMasa})</span>
                      </div>
                    </div>
                  </div>

                  {!isLast && (
                    <>
                      <div className="flex justify-center">
                        <div className="h-6 w-px bg-otl-gray-200" />
                      </div>
                      <div />
                    </>
                  )}
                </Fragment>
              )
            })}
          </div>
        ) : (
          <Callout variant="info">
            <CalloutTitle>Tiada Hasil</CalloutTitle>
            <CalloutContent>Tiada log aktiviti ditemui.</CalloutContent>
          </Callout>
        )}
      </div>

      <PaginationControl
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={[15, 30, 45, 60]}
      />
    </div>
  )
}
