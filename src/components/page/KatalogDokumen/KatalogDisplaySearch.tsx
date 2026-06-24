import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Excerpts from '@/components/shared/Excerpts'
import PaginationControl from '@/components/shared/PaginationControl'
import MetadataModalTidakLulus from '@/components/page/Homepage/TidakLulus/MetadataModalTidakLulus'
import { Spinner } from '@govtechmy/myds-react/spinner'
import { Callout, CalloutContent, CalloutTitle } from '@govtechmy/myds-react/callout'

export interface KatalogSearchResultItem {
  id: string
  recordDate: string
  peringkat_keselamatan: string
  status: string
  recordTitle: string
  profileDocument?: string
  unit?: {
    name?: string
  }
}

interface KatalogDisplaySearchProps {
  documents: KatalogSearchResultItem[]
  isLoading: boolean
  error: string | null
  searchKeyword: string
  pageNumber: number
  pageSize: number
  totalRecords: number
  onPageChange: (newPage: number) => void
  onPageSizeChange: (newSize: number) => void
}

const lokasiFolder = 'Carian katalog dokumen'

export default function KatalogDisplaySearch({
  documents,
  isLoading,
  error,
  searchKeyword,
  pageNumber,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
}: KatalogDisplaySearchProps) {
  const navigate = useNavigate()
  const { lang } = useParams<{ lang: string }>()
  const [isMetadataDialogOpen, setIsMetadataDialogOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <Callout variant="danger">
        <CalloutTitle>Ralat</CalloutTitle>
        <CalloutContent>{error}</CalloutContent>
      </Callout>
    )
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <p className="text-body-sm font-medium text-txt-black-500">
        {totalRecords} hasil carian untuk "{searchKeyword}"
      </p>

      <div className="h-full">
        {documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {documents.map((doc) => {
              const unit = doc.unit ?? {}

              return (
                <Excerpts
                  key={`${doc.id}`}
                  date={doc.recordDate || ''}
                  secretTag={doc.peringkat_keselamatan}
                  statusTag={doc.status}
                  title={doc.recordTitle || 'Tiada Tajuk Rekod'}
                  type={doc.profileDocument || 'Tiada Profil'}
                  unit={unit.name || 'Tiada Nama Unit'}
                  onClick={() => navigate(`/${lang}/katalog-dokumen/${doc.id}`)}
                />
              )
            })}
          </div>
        ) : (
          <Callout variant="info">
            <CalloutTitle>Tiada Hasil</CalloutTitle>
            <CalloutContent>Tiada dokumen ditemui untuk kata kunci ini.</CalloutContent>
          </Callout>
        )}
      </div>

      <MetadataModalTidakLulus
        open={isMetadataDialogOpen}
        onOpenChange={setIsMetadataDialogOpen}
        lokasiFolder={lokasiFolder}
      />

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
