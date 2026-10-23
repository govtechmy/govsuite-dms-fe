import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSearchStore } from '@/store/SearchStore'

export const SEARCH_PAGE_SIZE = 10
export const SEARCH_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50]

export function useSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const pageNumber = useSearchStore((state) => state.pageNumber)
  const pageSize = useSearchStore((state) => state.pageSize)

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams)
      params.set('page', String(page))
      params.set('limit', String(pageSize))
      setSearchParams(params)
    },
    [pageSize, searchParams, setSearchParams]
  )

  const changePageSize = useCallback(
    (size: number) => {
      const params = new URLSearchParams(searchParams)
      params.set('page', '1')
      params.set('limit', String(size))
      setSearchParams(params)
    },
    [searchParams, setSearchParams]
  )

  return { pageNumber, pageSize, goToPage, changePageSize }
}
