import { useCallback, useEffect, useRef, useState } from 'react'
import type { ProgressState } from '@/components/shared/ProgressResult'
import {
  getRecordViewPage,
  getRecordViewPages,
  type RecordViewPage,
} from '@/services/recordView.svc'

// A page can carry large base64 figures, so pages are fetched a few at a time
const RECORD_PAGE_CHUNK_SIZE = 3

type RecordView = {
  recordId: string
  // Single-page mode: the page this view was requested for
  requestedPage: number | null
  state: ProgressState
  // HTML of each loaded page, in page order
  pages: string[]
  totalPages: number
  loadedChunk: number
  isLoadingMore: boolean
  loadMoreFailed: boolean
}

const createRecordView = (
  recordId: string,
  requestedPage: number | null,
  state: ProgressState
): RecordView => ({
  recordId,
  requestedPage,
  state,
  pages: [],
  totalPages: 0,
  loadedChunk: 0,
  isLoadingMore: false,
  loadMoreFailed: false,
})

// The viewer's document is a list of `data-type="page"` nodes; content that is
// not already page-shaped (e.g. plain extracted text) is placed on an A4 sheet
const toPageHtml = ({ pageNumber, contentEditor }: RecordViewPage) =>
  contentEditor.includes('data-type="page"')
    ? contentEditor
    : `<div data-type="page" data-page="${pageNumber}" style="width: 794px; min-height: 1123px; padding: 72px"><div data-type="frame" style="position: static">${contentEditor}</div></div>`

/**
 * Loads a record's pages as HTML from the record view API: the first chunk of
 * pages, with `loadMore` appending the next chunk.
 *
 * Passing `onlyPage` switches to single-page mode: only that page is fetched
 * (null waits until the page is known), and changing it fetches the new page.
 */
export function useRecordHtmlView(recordId: string | undefined, onlyPage?: number | null) {
  const isSinglePageMode = onlyPage !== undefined
  const requestedPage = onlyPage ?? null
  const [view, setView] = useState<RecordView | null>(null)
  // Record whose next chunk is being fetched; blocks repeat calls before state catches up
  const loadMoreRecordIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!recordId || (isSinglePageMode && requestedPage === null)) return

    let cancelled = false
    setView(createRecordView(recordId, requestedPage, 'loading'))

    const request =
      requestedPage !== null
        ? getRecordViewPage(recordId, requestedPage).then(({ items }) => ({
            items,
            totalPages: items.length,
            loadedChunk: 0,
          }))
        : getRecordViewPages(recordId, { page: 1, pageSize: RECORD_PAGE_CHUNK_SIZE }).then(
            ({ items, meta }) => ({
              items,
              totalPages: meta.totalItems,
              loadedChunk: meta.currentPage,
            })
          )

    request
      .then(({ items, totalPages, loadedChunk }) => {
        if (cancelled) return
        if (items.length === 0) {
          throw new Error(`Record ${recordId} returned no pages`)
        }

        setView({
          ...createRecordView(recordId, requestedPage, 'success'),
          pages: items.map(toPageHtml),
          totalPages,
          loadedChunk,
        })
      })
      .catch((error) => {
        console.error('Error loading record HTML view:', error)
        if (!cancelled) {
          setView(createRecordView(recordId, requestedPage, 'error'))
        }
      })

    return () => {
      cancelled = true
    }
  }, [recordId, isSinglePageMode, requestedPage])

  const loadMore = useCallback(async () => {
    if (
      !view ||
      view.requestedPage !== null ||
      view.state !== 'success' ||
      view.pages.length >= view.totalPages ||
      loadMoreRecordIdRef.current === view.recordId
    ) {
      return
    }

    const { recordId: viewRecordId, loadedChunk } = view
    // Ignore the response if a different record has been loaded meanwhile
    const updateIfSameRecord = (update: (current: RecordView) => RecordView) =>
      setView((current) =>
        current?.recordId === viewRecordId && current.requestedPage === null
          ? update(current)
          : current
      )

    loadMoreRecordIdRef.current = viewRecordId
    updateIfSameRecord((current) => ({ ...current, isLoadingMore: true, loadMoreFailed: false }))

    try {
      const chunk = await getRecordViewPages(viewRecordId, {
        page: loadedChunk + 1,
        pageSize: RECORD_PAGE_CHUNK_SIZE,
      })

      updateIfSameRecord((current) => ({
        ...current,
        pages: [...current.pages, ...chunk.items.map(toPageHtml)],
        totalPages: chunk.meta.totalItems,
        loadedChunk: chunk.meta.currentPage,
        isLoadingMore: false,
      }))
    } catch (error) {
      console.error('Error loading record HTML pages:', error)
      updateIfSameRecord((current) => ({ ...current, isLoadingMore: false, loadMoreFailed: true }))
    } finally {
      if (loadMoreRecordIdRef.current === viewRecordId) {
        loadMoreRecordIdRef.current = null
      }
    }
  }, [view])

  // A view belongs to the record and page it was requested for; while a new one
  // is still being picked up, report it as loading instead of exposing the previous one
  const current =
    recordId && view?.recordId === recordId && view.requestedPage === requestedPage ? view : null
  const currentState = current?.state

  return {
    state: !recordId ? null : (currentState ?? ('loading' as ProgressState)),
    result:
      currentState === 'success' && current
        ? { pages: current.pages, totalPages: current.totalPages }
        : null,
    isLoadingMore: current?.isLoadingMore ?? false,
    loadMoreFailed: current?.loadMoreFailed ?? false,
    loadMore,
  }
}
