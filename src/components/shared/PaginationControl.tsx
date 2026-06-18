import { AutoPagination } from '@govtechmy/myds-react/pagination'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/shared/SelectMydsFix'

type PaginationControlProps = {
  pageNumber: number
  pageSize: number
  totalRecords: number
  onPageChange: (newPage: number) => void
  onPageSizeChange: (newSize: number) => void
  pageSizeOptions?: number[]
}

export default function PaginationControl({
  pageNumber,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 40, 50],
}: PaginationControlProps) {
  return (
    <div className="flex lg:justify-between max-lg:flex-col pt-3 max-lg:gap-6">
      {/* Rows per page selector */}
      <div className="flex gap-2 items-center max-lg:justify-center pr-2">
        <div className="text-body-sm text-txt-black-500">Baris setiap halaman</div>
        <Select
          size="small"
          variant="outline"
          value={pageSize.toString()}
          onValueChange={(val) => onPageSizeChange(Number(val))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih jumlah" />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((num) => (
              <SelectItem key={num} value={num.toString()}>
                {num}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pagination control */}
      <div>
        <AutoPagination
          page={pageNumber}
          limit={pageSize}
          count={totalRecords}
          type="default"
          maxDisplay={4}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  )
}
