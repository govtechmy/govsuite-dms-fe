import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/SelectMydsFix'
import { clx } from '@govtechmy/myds-react/utils'

interface DocumentRecord {
  documentId: string
  title: string
}

interface RecordResultSearchProps {
  documentRecords?: DocumentRecord[]
  selectedDocumentId?: string | null
  sortBy?: string
  onDocumentSelect?: (id: string) => void
  onSortChange?: (value: string) => void
}

export default function RecordResultSearch({
  documentRecords = [],
  selectedDocumentId,
  sortBy = 'latest',
  onDocumentSelect,
  onSortChange,
}: RecordResultSearchProps) {
  const handleSortChange = (value: string) => {
    onSortChange?.(value)
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full items-center justify-center gap-6">
        <p className="flex-1 text-body-md font-semibold text-txt-black-900">
          {documentRecords.length} Rekod Ditemui
        </p>
        <Select size="small" variant="outline" value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Terkini" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Terkini</SelectItem>
            <SelectItem value="oldest">Terlama</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documents List */}
      <div className="flex w-full flex-col overflow-hidden rounded-xl border border-otl-gray-200 bg-bg-dialog p-2">
        <div className="flex flex-col gap-0 overflow-y-auto">
          {documentRecords.map((record) => (
            <button
              key={record.documentId}
              onClick={() => onDocumentSelect?.(record.documentId)}
              className={clx(
                'flex w-full cursor-pointer items-center gap-2 rounded px-2.5 py-1.5 text-left transition-colors',
                selectedDocumentId === record.documentId
                  ? 'bg-primary-600 text-txt-white'
                  : 'text-txt-black-900 hover:bg-bg-washed'
              )}
            >
              <p className="flex-1 truncate text-body-xs font-medium">{record.title}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
