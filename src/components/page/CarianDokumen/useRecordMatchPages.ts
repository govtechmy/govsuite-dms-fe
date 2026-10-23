import { useCallback, useEffect, useRef, useState } from 'react'
import { getRecordMatchPages, type RecordMatchPage } from '@/services/catalog.svc'

const MATCH_PAGES_PAGE_SIZE = 10

type MatchPagesStatus = 'idle' | 'loading' | 'success' | 'error'

/** Pages of the selected record that contain the keyword, loaded 10 at a time. */
export function useRecordMatchPages(recordId: string | null, query: string) {
  const [pages, setPages] = useState<RecordMatchPage[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [nextPage, setNextPage] = useState<number | null>(null)
  const [status, setStatus] = useState<MatchPagesStatus>('idle')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  // Ignores responses for a record or keyword that is no longer selected
  const requestTokenRef = useRef(0)

  const fetchPage = useCallback(
    async (page: number) => {
      if (!recordId || !query) return

      const requestToken = requestTokenRef.current
      if (page === 1) {
        setStatus('loading')
      } else {
        setIsLoadingMore(true)
      }

      try {
        const response = await getRecordMatchPages({
          recordId,
          query,
          page,
          limit: MATCH_PAGES_PAGE_SIZE,
        })
        if (requestToken !== requestTokenRef.current) return

        setPages((previous) => (page === 1 ? response.items : [...previous, ...response.items]))
        setTotalItems(response.meta.totalItems)
        setNextPage(response.meta.hasNextPage ? page + 1 : null)
        setStatus('success')
      } catch {
        if (requestToken !== requestTokenRef.current) return
        // A failed later page keeps the pages already shown
        if (page === 1) setStatus('error')
      } finally {
        if (requestToken === requestTokenRef.current) setIsLoadingMore(false)
      }
    },
    [recordId, query]
  )

  useEffect(() => {
    requestTokenRef.current += 1
    setPages([])
    setTotalItems(0)
    setNextPage(null)
    setIsLoadingMore(false)
    setStatus(recordId && query ? 'loading' : 'idle')
    void fetchPage(1)
  }, [fetchPage, recordId, query])

  const loadMore = useCallback(() => {
    if (nextPage !== null && !isLoadingMore) void fetchPage(nextPage)
  }, [fetchPage, isLoadingMore, nextPage])

  const retry = useCallback(() => void fetchPage(1), [fetchPage])

  return {
    pages,
    totalItems,
    status,
    hasMore: nextPage !== null,
    isLoadingMore,
    loadMore,
    retry,
  }
}
