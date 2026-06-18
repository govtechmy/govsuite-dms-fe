import MainHeading from '@/components/layout/MainHeading'
import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'
import MetadataModalTidakLulus from '@/components/page/Homepage/TidakLulus/MetadataModalTidakLulus'
import SelectCarianDokumenTidakLulus from '@/components/page/Homepage/TidakLulus/SelectCarianDokumenTidakLulus'
import SearchBarKatalogDokumen from '@/components/page/KatalogDokumen/SearchBarKatalogDokumen'
import Excerpts from '@/components/shared/Excerpts'
import PaginationControl from '@/components/shared/PaginationControl'
import { ArrowBackIcon } from '@govtechmy/myds-react/icon'
import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

// Mock data for documents requiring approval
const mockDocuments = [
  {
    document_id: '0001',
    path: '/docs/2024/budget-proposal.pdf',
    date: '2024-06-15',
    peringkat_keselamatan: 'Sulit',
    status: 'DALAM_SEMAKAN',
    document_name: 'Cadangan Bajet Tahunan 2025',
    type: 'Minit Mesyuarat',
    unit: 'Unit K',
  },
  {
    document_id: '0002',
    path: '/docs/2024/policy-review.pdf',
    date: '2024-06-15',
    peringkat_keselamatan: 'terbuka',
    status: 'DALAM_SEMAKAN',
    document_name: 'Semakan Dasar Pembangunan Sosial',
    type: 'Minit Mesyuarat',
    unit: 'Unit K',
  },
  {
    document_id: '0003',
    path: '/docs/2024/infrastructure-plan.pdf',
    date: '2024-06-15',
    peringkat_keselamatan: 'RAHSIA_BESAR',
    status: 'TIDAK_DILULUSKAN',
    document_name: 'Pelan Pembangunan Infrastruktur Negara',
    type: 'Minit Mesyuarat',
    unit: 'Unit K',
  },
  {
    document_id: '0004',
    path: '/docs/2024/education-reform.pdf',
    date: '2024-06-12',
    peringkat_keselamatan: 'rahsia',
    status: 'DALAM_SEMAKAN',
    document_name: 'Reformasi Sistem Pendidikan Tinggi',
    type: 'Minit Mesyuarat',
    unit: 'Unit K',
  },
  {
    document_id: '0005',
    path: '/docs/2024/healthcare-initiative.pdf',
    date: '2024-06-11',
    peringkat_keselamatan: 'Sulit',
    status: 'DALAM_SEMAKAN',
    document_name: 'Inisiatif Kesihatan Awam 2025',
    type: 'Minit Mesyuarat',
    unit: 'Unit K',
  },
  {
    document_id: '0006',
    path: '/docs/2024/economic-outlook.pdf',
    date: '2024-06-10',
    peringkat_keselamatan: 'terbuka',
    status: 'Draf',
    document_name: 'Tinjauan Ekonomi Suku Kedua 2024',
    type: 'Minit Mesyuarat',
    unit: 'Unit K',
  },
  {
    document_id: '0007',
    path: '/docs/2024/digital-transformation.pdf',
    date: '2024-06-09',
    peringkat_keselamatan: 'Sulit',
    status: 'DALAM_SEMAKAN',
    document_name: 'Transformasi Digital Sektor Awam',
    type: 'Minit Mesyuarat',
    unit: 'Unit K',
  },
  {
    document_id: '0008',
    path: '/docs/2024/environmental-policy.pdf',
    date: '2024-06-08',
    peringkat_keselamatan: 'terbuka',
    status: 'DALAM_SEMAKAN',
    document_name: 'Dasar Alam Sekitar Lestari',
    type: 'Minit Mesyuarat',
    unit: 'Unit K',
  },
  {
    document_id: '0009',
    path: '/docs/2024/trade-agreement.pdf',
    date: '2024-06-07',
    peringkat_keselamatan: 'RAHSIA_BESAR',
    status: 'DALAM_SEMAKAN',
    document_name: 'Perjanjian Perdagangan Serantau',
    type: 'Minit Mesyuarat',
    unit: 'Unit K',
  },
  {
    document_id: '0010',
    path: '/docs/2024/youth-program.pdf',
    date: '2024-06-06',
    peringkat_keselamatan: 'terbuka',
    status: 'DALAM_SEMAKAN',
    document_name: 'Program Pembangunan Belia Negara',
    type: 'Minit Mesyuarat',
    unit: 'Unit K',
  },
  {
    document_id: '0011',
    path: '/docs/2024/housing-scheme.pdf',
    date: '2024-06-05',
    peringkat_keselamatan: 'Sulit',
    status: 'DALAM_SEMAKAN',
    document_name: 'Skim Perumahan Mampu Milik Fasa 3',
    type: 'Minit Mesyuarat',
    unit: 'Unit K',
  },
  {
    document_id: '0012',
    path: '/docs/2024/transport-master-plan.pdf',
    date: '2024-06-04',
    peringkat_keselamatan: 'terbuka',
    status: 'DALAM_SEMAKAN',
    document_name: 'Pelan Induk Pengangkutan Awam',
    type: 'Minit Mesyuarat',
    unit: 'Unit K',
  },
  {
    document_id: '0013',
    path: '/docs/2024/youth-program.pdf',
    date: '2024-06-06',
    peringkat_keselamatan: 'terbuka',
    status: 'DALAM_SEMAKAN',
    document_name: 'Program Pembangunan Belia Negara',
    type: 'Minit Mesyuarat',
    unit: 'Unit K',
  },
  {
    document_id: '0014',
    path: '/docs/2024/housing-scheme.pdf',
    date: '2024-06-05',
    peringkat_keselamatan: 'Sulit',
    status: 'DALAM_SEMAKAN',
    document_name: 'Skim Perumahan Mampu Milik Fasa 3',
    type: 'Minit Mesyuarat',
    unit: 'Unit K',
  },
  {
    document_id: '0015',
    path: '/docs/2024/transport-master-plan.pdf',
    date: '2024-06-04',
    peringkat_keselamatan: 'terbuka',
    status: 'DALAM_SEMAKAN',
    document_name: 'Pelan Induk Pengangkutan Awam',
    type: 'Minit Mesyuarat',
    unit: 'Unit K',
  },
]

const lokasiFolder = 'JKKPN > 2025 - 2029 > 2025 > January > Minit Jemaah Menteri Bil. 12/2026'

export default function TidakLulusPage() {
  const navigate = useNavigate()
  const { lang } = useParams()
  const activeLang = lang ?? localStorage.getItem('lang') ?? 'ms'
  const [isMetadataDialogOpen, setIsMetadataDialogOpen] = useState(false)

  const [documents, setDocuments] = useState({
    pageNumber: 1,
    pageSize: 15,
    totalRecords: mockDocuments.length,
  })

  const setPaginationNumber = (newPage: number) => {
    setDocuments((prev) => ({ ...prev, pageNumber: newPage }))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setPaginationSize = ([_reset, newSize]: [boolean, number]) => {
    setDocuments((prev) => ({ ...prev, pageSize: newSize, pageNumber: 1 }))
  }

  // Calculate current page documents
  const currentDocuments = useMemo(() => {
    const startIndex = (documents.pageNumber - 1) * documents.pageSize
    const endIndex = startIndex + documents.pageSize
    return mockDocuments.slice(startIndex, endIndex)
  }, [documents.pageNumber, documents.pageSize])

  return (
    <RightSidePageLayoutWrapper className="h-full">
      <div className="flex h-full flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex gap-3 items-center">
            <button
              type="button"
              onClick={() => navigate(`/${activeLang}`)}
              aria-label="Kembali ke halaman utama"
              className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-primary"
            >
              <ArrowBackIcon />
            </button>
            <MainHeading>Dokumen Tidak Diluluskan</MainHeading>
          </div>
          <p className="text-body-sm font-medium text-txt-black-500">
            Terdapat {documents.totalRecords} dokumen tidak diluluskan.
          </p>
          <SearchBarKatalogDokumen />
          <SelectCarianDokumenTidakLulus />
        </div>

        <div className="h-full">
          {currentDocuments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {currentDocuments.map((doc) => (
                <Excerpts
                  key={doc.document_id}
                  date={doc.date || 'No Date Found'}
                  secretTag={doc.peringkat_keselamatan}
                  statusTag={doc.status}
                  title={doc.document_name || 'No Document Name Found'}
                  type={doc.type || 'No Type of Document Found'}
                  unit={doc.unit || 'No Unit Found'}
                  onClick={() => {
                    setIsMetadataDialogOpen(true)
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <MetadataModalTidakLulus
          open={isMetadataDialogOpen}
          onOpenChange={setIsMetadataDialogOpen}
          lokasiFolder={lokasiFolder}
        />

        <PaginationControl
          pageNumber={documents?.pageNumber ?? 1}
          pageSize={documents?.pageSize ?? 15}
          totalRecords={documents?.totalRecords ?? 0}
          onPageChange={(newPage): number => {
            setPaginationNumber(newPage)
            return newPage
          }}
          onPageSizeChange={(newSize: number) => {
            setPaginationSize([true, newSize])
          }}
          pageSizeOptions={[15, 30, 45, 60]}
        />
      </div>
    </RightSidePageLayoutWrapper>
  )
}
