import { useEffect, useState } from 'react'
import { toPageHtml } from '@/components/page/KatalogDokumen/DokumenID/pdfPageNodes'
import type { ProgressState } from '@/components/shared/ProgressResult'
import { getRecordViewPages } from '@/services/recordView.svc'

// A page can carry large base64 figures, so pages are fetched a few at a time
const RECORD_PAGE_CHUNK_SIZE = 3

// Shared so an empty result keeps the same reference across renders
const NO_PAGES: string[] = []

type RecordView = {
  recordId: string
  state: ProgressState
  // HTML of each loaded page, in page order
  pages: string[]
  totalPages: number
}

/**
 * Loads all of a record's pages as HTML from the record view API, one chunk
 * after another. The view becomes `success` once the first chunk arrives;
 * later chunks are appended to `pages` as they load.
 */
export function useRecordHtmlView(recordId: string | undefined) {
  const [view, setView] = useState<RecordView | null>(null)

  useEffect(() => {
    if (!recordId) return

    // Set when the record changes or the page unmounts, so a late response is ignored
    let cancelled = false
    setView({ recordId, state: 'loading', pages: [], totalPages: 0 })

    const loadAllPages = async () => {
      for (let page = 1; ; page++) {
        const { items, meta } = await getRecordViewPages(recordId, {
          page,
          pageSize: RECORD_PAGE_CHUNK_SIZE,
        })
        if (cancelled) return
        if (page === 1 && items.length === 0) {
          throw new Error(`Record ${recordId} returned no pages`)
        }

        const newPages = items.map(toPageHtml)
        setView((current) =>
          current?.recordId === recordId
            ? {
                ...current,
                state: 'success',
                pages: [...current.pages, ...newPages],
                totalPages: meta.totalItems,
              }
            : current
        )

        // Stop on the last chunk, and on an empty one so a wrong `hasNextPage` cannot loop forever
        if (!meta.hasNextPage || items.length === 0 || page >= meta.totalPages) return
      }
    }

    loadAllPages().catch((error) => {
      console.error('Error loading record HTML view:', error)
      if (cancelled) return
      // Keep pages that already loaded; fail the view only when there is nothing to show
      setView((current) =>
        current?.recordId === recordId && current.pages.length === 0
          ? { ...current, state: 'error' }
          : current
      )
    })

    return () => {
      cancelled = true
    }
  }, [recordId])

  // Until the view for this record exists (first render, or just after the record
  // changes), report loading instead of null or the previous record's pages
  const current = view?.recordId === recordId ? view : null

  return {
    state: !recordId ? null : (current?.state ?? ('loading' as ProgressState)),
    pages: current?.pages ?? NO_PAGES,
    totalPages: current?.totalPages ?? 0,
  }
}
