import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationNumber,
  PaginationPrevious,
} from '@govtechmy/myds-react/pagination'
import { clx } from '@govtechmy/myds-react/utils'

interface CompactPaginationProps {
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  // Stretch the controls across the container instead of sizing them to their content
  fullWidth?: boolean
  // `small` shrinks the controls further so they fit beside other footer controls
  size?: 'default' | 'small'
}

// MYDS AutoPagination renders 40px buttons with 16px gaps, which overflows the narrow search
// result columns, so the pagination is composed from its primitives with compact 32px buttons.
const SIZE_CLASS_NAME = {
  default: { button: 'size-8 justify-center p-0 text-body-sm', ellipsis: 'size-8', gap: 'gap-1' },
  small: { button: 'size-7 justify-center p-0 text-body-xs', ellipsis: 'size-7', gap: 'gap-0.5' },
}
// Same classes as the MYDS Button `primary-fill` variant, for the active page
const PAGINATION_ACTIVE_CLASS_NAME =
  'border border-primary-600 bg-primary-600 text-white shadow-button hover:bg-primary-700'

// At most five slots between the arrows, e.g. "1 2 3 … 9", "1 … 5 … 9" or "1 … 7 8 9".
const getVisiblePages = (page: number, totalPages: number): (number | 'ellipsis')[] => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }
  if (page <= 3) {
    return [1, 2, 3, 'ellipsis', totalPages]
  }
  if (page >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages]
  }
  return [1, 'ellipsis', page, 'ellipsis', totalPages]
}

export default function CompactPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  fullWidth = false,
  size = 'default',
}: CompactPaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize)
  const sizeClassName = SIZE_CLASS_NAME[size]

  return (
    <Pagination
      page={page}
      limit={pageSize}
      count={totalItems}
      type="default"
      onPageChange={onPageChange}
      className={fullWidth ? undefined : 'w-auto shrink-0'}
    >
      <PaginationContent className={clx(sizeClassName.gap, fullWidth && 'w-full justify-between')}>
        <PaginationItem>
          <PaginationPrevious className={sizeClassName.button} />
        </PaginationItem>
        {getVisiblePages(page, totalPages).map((visiblePage, index) => (
          <PaginationItem key={`${visiblePage}-${index}`}>
            {visiblePage === 'ellipsis' ? (
              <PaginationEllipsis className={sizeClassName.ellipsis} />
            ) : (
              <PaginationNumber
                number={visiblePage}
                aria-current={visiblePage === page ? 'page' : undefined}
                className={clx(
                  sizeClassName.button,
                  visiblePage === page && PAGINATION_ACTIVE_CLASS_NAME
                )}
              />
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext className={sizeClassName.button} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
