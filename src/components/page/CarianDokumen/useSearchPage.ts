import { useSearchStore } from '@/store/SearchStore'

export const SEARCH_PAGE_SIZE = 10

export function useSearchPage() {
  const pageNumber = useSearchStore((state) => state.pageNumber)
  const pageSize = useSearchStore((state) => state.pageSize)

  return { pageNumber, pageSize }
}
