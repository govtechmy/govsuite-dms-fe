import type { MetadataHistoryItem } from '@/services/metadata.svc'
import { renderStatusTag } from '@/utils/RenderTag'
import { formatDateTimeUpdatedDisplay } from '@/utils/formatDate'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from '@govtechmy/myds-react/table'

interface RecordHistoryListProps {
  history: MetadataHistoryItem[]
}

const TABLE_COLUMN_COUNT = 3

export default function RecordHistoryList({ history }: RecordHistoryListProps) {
  return (
    <div className="flex flex-col gap-6">
      <span className="font-body text-body-md font-semibold text-txt-black-900">
        Sejarah Dokumen
      </span>
      <Table>
        <TableHeader className="bg-bg-white">
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Tarikh/Masa</TableHead>
            <TableHead>Nama</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.length > 0 ? (
            history.map((item, index) => (
              <TableRow key={`${item.status}-${item.date}-${index}`}>
                <TableCell>{renderStatusTag(item.status)}</TableCell>
                <TableCell className="text-txt-black-500">
                  {formatDateTimeUpdatedDisplay(item.date)}
                </TableCell>
                <TableCell className="font-medium">
                  {item.name}
                  {/* {item.comment && (
                    <div className="font-normal text-txt-black-500">{item.comment}</div>
                  )} */}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableEmpty colSpan={TABLE_COLUMN_COUNT}>Tiada sejarah dokumen ditemui.</TableEmpty>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
