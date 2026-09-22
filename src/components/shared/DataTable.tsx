import type { UIEvent } from 'react'
import { clx } from '@govtechmy/myds-react/utils'

export interface DataTableColumn<T> {
  header: string
  className?: string
  render: (row: T, index: number) => React.ReactNode
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  rowKey: (row: T, index: number) => string
  onRowClick?: (row: T) => void
  rowClassName?: string
  stickyHeader?: boolean
  scrollContainerClassName?: string
  onScroll?: (event: UIEvent<HTMLDivElement>) => void
  ariaLabel?: string
}

export default function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  rowClassName,
  stickyHeader,
  scrollContainerClassName,
  onScroll,
  ariaLabel,
}: DataTableProps<T>) {
  return (
    <div
      className={clx(
        'overflow-auto rounded-lg border border-otl-gray-200',
        scrollContainerClassName
      )}
      onScroll={onScroll}
      role={onScroll ? 'region' : undefined}
      aria-label={onScroll ? ariaLabel : undefined}
      tabIndex={onScroll ? 0 : undefined}
    >
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className={rowClassName}>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={clx(
                  'border-b border-otl-gray-200 bg-bg-washed px-4 py-3 text-body-sm font-normal text-txt-black-700',
                  stickyHeader && 'sticky top-0 z-10',
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowKey(row, rowIndex)}
              className={clx(
                'border-b border-otl-gray-200 last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-primary focus-visible:ring-inset',
                onRowClick && 'cursor-pointer hover:bg-bg-washed',
                rowClassName
              )}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={
                onRowClick
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onRowClick(row)
                      }
                    }
                  : undefined
              }
              tabIndex={onRowClick ? 0 : undefined}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className={clx('px-4 py-3', column.className)}>
                  {column.render(row, rowIndex)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
