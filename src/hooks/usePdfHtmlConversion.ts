import { useCallback, useEffect, useRef, useState } from 'react'
import type { ProgressState } from '@/components/shared/ProgressResult'
import { apiAuthHeaders } from '@/services/http'
import {
  getPdfConvertPages,
  getPdfConvertStatus,
  postPdfConvert,
  type PdfConvertResult,
} from '@/services/pdfConvert.svc'

const PDF_CONVERT_POLL_INTERVAL_MS = 1000
const PDF_CONVERT_TIMEOUT_MS = 3 * 60 * 1000
// A converted page can carry large base64 figures, so pages are fetched a few at a time
const PDF_PAGE_CHUNK_SIZE = 3

type Conversion = {
  pdfUrl: string
  state: ProgressState
  jobId: string | null
  baseStyle?: PdfConvertResult['baseStyle']
  // HTML of each loaded page, in page order
  pages: string[]
  totalPages: number
  loadedChunk: number
  // Single-page mode: the PDF page currently held in `pages`
  loadedPage: number | null
  isLoadingMore: boolean
  loadMoreFailed: boolean
}

const createConversion = (pdfUrl: string, state: ProgressState): Conversion => ({
  pdfUrl,
  state,
  jobId: null,
  pages: [],
  totalPages: 0,
  loadedChunk: 0,
  loadedPage: null,
  isLoadingMore: false,
  loadMoreFailed: false,
})

/**
 * Converts the PDF at `pdfUrl` to HTML via pdf-page-cast: fetches the PDF,
 * uploads it as a background job and polls until the conversion is done, then
 * loads the first chunk of pages. `loadMore` appends the next chunk.
 * Polling stops when `pdfUrl` changes or the component unmounts.
 *
 * Passing `onlyPage` switches to single-page mode: only that PDF page is fetched
 * (null waits until the page is known), and changing it fetches the new page
 * from the same job without converting again.
 */
export function usePdfHtmlConversion(
  pdfUrl: string | undefined,
  fileName: string,
  onlyPage?: number | null
) {
  const isSinglePageMode = onlyPage !== undefined
  const [conversion, setConversion] = useState<Conversion | null>(null)
  // Job whose next chunk is being fetched; blocks repeat calls before state catches up
  const loadMoreJobIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!pdfUrl) return

    let cancelled = false

    const convert = async () => {
      setConversion(createConversion(pdfUrl, 'loading'))

      try {
        const pdfResponse = await fetch(pdfUrl, { headers: apiAuthHeaders() })
        if (!pdfResponse.ok) {
          throw new Error(`Failed to fetch PDF (${pdfResponse.status})`)
        }
        const pdfBlob = await pdfResponse.blob()
        if (cancelled) return

        const { jobId } = await postPdfConvert(pdfBlob, fileName)
        const deadline = Date.now() + PDF_CONVERT_TIMEOUT_MS

        while (!cancelled) {
          const job = await getPdfConvertStatus(jobId)
          if (cancelled) return

          if (job.status === 'completed') {
            if (isSinglePageMode) {
              setConversion({ ...createConversion(pdfUrl, 'success'), jobId })
              return
            }

            const firstChunk = await getPdfConvertPages(jobId, {
              page: 1,
              pageSize: PDF_PAGE_CHUNK_SIZE,
            })
            if (cancelled) return

            if (firstChunk.items.length === 0) {
              throw new Error('pdf-page-cast returned no pages')
            }

            setConversion({
              ...createConversion(pdfUrl, 'success'),
              jobId,
              baseStyle: firstChunk.baseStyle,
              pages: firstChunk.items.map((item) => item.html),
              totalPages: firstChunk.meta.totalItems,
              loadedChunk: firstChunk.meta.currentPage,
            })
            return
          }

          if (job.status === 'failed') {
            throw new Error(job.error ?? 'pdf-page-cast conversion failed')
          }

          if (Date.now() >= deadline) {
            throw new Error(`pdf-page-cast job ${jobId} timed out`)
          }

          await new Promise((resolve) => setTimeout(resolve, PDF_CONVERT_POLL_INTERVAL_MS))
        }
      } catch (error) {
        console.error('Error converting PDF via pdf-page-cast:', error)
        if (!cancelled) {
          setConversion(createConversion(pdfUrl, 'error'))
        }
      }
    }

    convert()

    return () => {
      cancelled = true
    }
  }, [pdfUrl, fileName, isSinglePageMode])

  const completedJobId = conversion?.state === 'success' ? conversion.jobId : null

  useEffect(() => {
    if (!completedJobId || onlyPage == null) return

    let cancelled = false
    // Ignore the response if a different document or page has been requested meanwhile
    const updateIfSameJob = (update: (current: Conversion) => Conversion) => {
      if (!cancelled) {
        setConversion((current) => (current?.jobId === completedJobId ? update(current) : current))
      }
    }

    getPdfConvertPages(completedJobId, { page: onlyPage, pageSize: 1 })
      .then((response) => {
        if (response.items.length === 0) {
          throw new Error(`pdf-page-cast returned no page ${onlyPage}`)
        }
        updateIfSameJob((current) => ({
          ...current,
          baseStyle: response.baseStyle,
          pages: response.items.map((item) => item.html),
          totalPages: response.items.length,
          loadedPage: onlyPage,
        }))
      })
      .catch((error) => {
        console.error('Error loading converted PDF page:', error)
        updateIfSameJob((current) => ({ ...current, state: 'error' }))
      })

    return () => {
      cancelled = true
    }
  }, [completedJobId, onlyPage])

  const loadMore = useCallback(async () => {
    if (
      !conversion?.jobId ||
      conversion.state !== 'success' ||
      conversion.pages.length >= conversion.totalPages ||
      loadMoreJobIdRef.current === conversion.jobId
    ) {
      return
    }

    const { jobId, loadedChunk } = conversion
    // Ignore the response if a different document has been loaded meanwhile
    const updateIfSameJob = (update: (current: Conversion) => Conversion) =>
      setConversion((current) => (current?.jobId === jobId ? update(current) : current))

    loadMoreJobIdRef.current = jobId
    updateIfSameJob((current) => ({ ...current, isLoadingMore: true, loadMoreFailed: false }))

    try {
      const chunk = await getPdfConvertPages(jobId, {
        page: loadedChunk + 1,
        pageSize: PDF_PAGE_CHUNK_SIZE,
      })

      updateIfSameJob((current) => ({
        ...current,
        pages: [...current.pages, ...chunk.items.map((item) => item.html)],
        totalPages: chunk.meta.totalItems,
        loadedChunk: chunk.meta.currentPage,
        isLoadingMore: false,
      }))
    } catch (error) {
      console.error('Error loading converted PDF pages:', error)
      updateIfSameJob((current) => ({ ...current, isLoadingMore: false, loadMoreFailed: true }))
    } finally {
      if (loadMoreJobIdRef.current === jobId) {
        loadMoreJobIdRef.current = null
      }
    }
  }, [conversion])

  // A result belongs to the URL it was converted from; while a new URL is still
  // being picked up, report it as loading instead of exposing the previous document
  const current = pdfUrl && conversion?.pdfUrl === pdfUrl ? conversion : null
  // In single-page mode the result is only ready once the requested page has arrived
  const isWaitingForPage =
    isSinglePageMode && current?.state === 'success' && current.loadedPage !== onlyPage
  const currentState = isWaitingForPage ? 'loading' : current?.state

  return {
    state: !pdfUrl ? null : (currentState ?? ('loading' as ProgressState)),
    result:
      currentState === 'success' && current
        ? { baseStyle: current.baseStyle, pages: current.pages, totalPages: current.totalPages }
        : null,
    isLoadingMore: current?.isLoadingMore ?? false,
    loadMoreFailed: current?.loadMoreFailed ?? false,
    loadMore,
  }
}
