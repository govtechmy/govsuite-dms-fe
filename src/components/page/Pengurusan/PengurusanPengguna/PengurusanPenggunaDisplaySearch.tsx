import PaginationControl from '@/components/shared/PaginationControl'
import type { PenggunaItem } from '@/services/pengurusanPengguna.svc'
// import { renderSecretTag } from '@/utils/RenderTag'
import { Button } from '@govtechmy/myds-react/button'
import { Callout, CalloutContent, CalloutTitle } from '@govtechmy/myds-react/callout'
import { EditIcon } from '@govtechmy/myds-react/icon'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeleton,
} from '@govtechmy/myds-react/table'
import { Tag } from '@govtechmy/myds-react/tag'

interface PengurusanPenggunaDisplaySearchProps {
  users: PenggunaItem[]
  unitNameById: Record<string, string>
  roleNameByCode: Record<string, string>
  isLoading: boolean
  error: string | null
  pageNumber: number
  pageSize: number
  totalRecords: number
  onPageChange: (newPage: number) => void
  onPageSizeChange: (newSize: number) => void
}

const TABLE_COLUMN_COUNT = 5
const SKELETON_ROW_COUNT = 8

export default function PengurusanPenggunaDisplaySearch({
  users,
  unitNameById,
  roleNameByCode,
  isLoading,
  error,
  pageNumber,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
}: PengurusanPenggunaDisplaySearchProps) {
  if (error) {
    return (
      <Callout variant="danger">
        <CalloutTitle>Ralat</CalloutTitle>
        <CalloutContent>{error}</CalloutContent>
      </Callout>
    )
  }

  return (
    <div className="flex h-full flex-col gap-6 justify-between">
      <Table>
        <TableHeader className="bg-bg-white">
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Email (ID Pengguna)</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Peranan Pengguna</TableHead>
            <TableHead>Tindakan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`}>
                {Array.from({ length: TABLE_COLUMN_COUNT }).map((__, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <TableSkeleton />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell className="text-txt-black-500">{user.email}</TableCell>
                <TableCell>{unitNameById[user.unitId] ?? user.unitId}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                      <Tag key={role} mode="pill" size="small" variant="primary">
                        {roleNameByCode[role] ?? role}
                      </Tag>
                    ))}
                  </div>
                </TableCell>
                {/* <TableCell>{renderSecretTag(user.tahapKeselamatan)}</TableCell> */}
                <TableCell>
                  <Button variant={'default-outline'} size={'small'}>
                    <EditIcon></EditIcon>Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableEmpty colSpan={TABLE_COLUMN_COUNT}>
                Tiada pengguna ditemui untuk penapis ini.
              </TableEmpty>
            </TableRow>
          )}
        </TableBody>
      </Table>

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
