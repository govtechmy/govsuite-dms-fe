import DataTable, { type DataTableColumn } from '@/components/shared/DataTable'
import { formatDateTimeUpdatedDisplay } from '@/utils/formatDate'
import { renderStatusTag, renderSecretTag } from '@/utils/RenderTag'
import { ChevronRightIcon } from '@govtechmy/myds-react/icon'
import type { KatalogSearchResultItem } from './KatalogDisplaySearch'

interface KatalogDisplaySearchListProps {
  documents: KatalogSearchResultItem[]
  onItemClick: (recordId: string, item?: KatalogSearchResultItem) => void
}

const columns: DataTableColumn<KatalogSearchResultItem>[] = [
  {
    header: 'Nama',
    render: (doc) => (
      <div className="line-clamp-1 max-w-[450px] text-body-sm font-normal text-txt-black-900">
        {doc.recordTitle || 'Tiada Tajuk Rekod'}
      </div>
    ),
  },
  {
    header: 'Tarikh Dokumen',
    className: 'whitespace-nowrap',
    render: (doc) => (
      <span className="text-body-sm text-txt-black-700">
        {formatDateTimeUpdatedDisplay(doc.recordDate) || '-'}
      </span>
    ),
  },
  {
    header: 'Status Dokumen',
    render: (doc) => renderStatusTag(doc.status || 'Not Set'),
  },
  {
    header: 'Akses Keselamatan',
    render: (doc) => (
      <div className="flex items-center justify-between gap-2">
        {renderSecretTag(doc.accessLevel || 'Not Set')}
        <ChevronRightIcon className="size-3.5 text-txt-black-500" />
      </div>
    ),
  },
]

export default function KatalogDisplaySearchList({
  documents,
  onItemClick,
}: KatalogDisplaySearchListProps) {
  return (
    <DataTable
      columns={columns}
      data={documents}
      rowKey={(doc, index) => doc.recordId || `${index}`}
      onRowClick={(doc) => onItemClick(doc.recordId || 'TiadaRekod', doc)}
    />
  )
}
