import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

type ItemMatch = {
  start: number
  end: number
  globalMatchIndex: number
}

type MatchesByPage = Record<number, Record<number, ItemMatch[]>>

type TextLayerSuccessPayload = {
  items: unknown[]
}

type CustomTextRenderPayload = {
  itemIndex?: number
  str?: string
  pageNumber?: number
}

export type PdfSearchNavigationRequest = {
  action: 'next' | 'previous' | 'jump'
  targetMatchIndex?: number
  token: number
}

export type PdfSearchState = {
  totalMatches: number
  currentMatchIndex: number
}

interface PdfJsDocumentViewerProps {
  fileUrl: string
  searchKeyword?: string
  navigationRequest?: PdfSearchNavigationRequest | null
  onSearchStateChange?: (state: PdfSearchState) => void
  onDocumentLoad?: () => void
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const extractTextItems = (items: unknown[]): string[] => {
  return items.map((item) => {
    if (typeof item !== 'object' || item === null) {
      return ''
    }

    const textValue = (item as { str?: unknown }).str
    return typeof textValue === 'string' ? textValue : ''
  })
}

const renderHighlightedText = (text: string, matches?: ItemMatch[]) => {
  if (!matches || matches.length === 0) {
    return escapeHtml(text)
  }

  let cursor = 0
  let result = ''

  for (const match of matches) {
    result += escapeHtml(text.slice(cursor, match.start))
    result += `<mark class="pdf-search-match" data-pdf-match-index="${match.globalMatchIndex}">${escapeHtml(
      text.slice(match.start, match.end)
    )}</mark>`
    cursor = match.end
  }

  result += escapeHtml(text.slice(cursor))
  return result
}

export default function PdfJsDocumentViewer({
  fileUrl,
  searchKeyword = '',
  navigationRequest,
  onSearchStateChange,
  onDocumentLoad,
}: PdfJsDocumentViewerProps) {
  const [numPages, setNumPages] = useState(0)
  const [pageTextItems, setPageTextItems] = useState<Record<number, string[]>>({})
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1)
  const [pageWidth, setPageWidth] = useState<number | undefined>()
  const handledNavigationTokenRef = useRef<number | null>(null)
  const previousKeywordRef = useRef('')
  const viewportRef = useRef<HTMLDivElement>(null)

  const normalizedKeyword = searchKeyword.trim().toLocaleLowerCase()

  const matchesData = useMemo(() => {
    const matchesByPage: MatchesByPage = {}
    let runningMatchIndex = 0

    if (!normalizedKeyword) {
      return {
        matchesByPage,
        totalMatches: 0,
      }
    }

    for (let pageNumber = 1; pageNumber <= numPages; pageNumber += 1) {
      const pageItems = pageTextItems[pageNumber] ?? []

      pageItems.forEach((pageText, itemIndex) => {
        const normalizedPageText = pageText.toLocaleLowerCase()
        const itemMatches: ItemMatch[] = []
        let startPosition = 0

        while (startPosition < normalizedPageText.length) {
          const foundIndex = normalizedPageText.indexOf(normalizedKeyword, startPosition)

          if (foundIndex < 0) {
            break
          }

          itemMatches.push({
            start: foundIndex,
            end: foundIndex + normalizedKeyword.length,
            globalMatchIndex: runningMatchIndex,
          })

          runningMatchIndex += 1
          startPosition = foundIndex + normalizedKeyword.length
        }

        if (itemMatches.length > 0) {
          if (!matchesByPage[pageNumber]) {
            matchesByPage[pageNumber] = {}
          }
          matchesByPage[pageNumber][itemIndex] = itemMatches
        }
      })
    }

    return {
      matchesByPage,
      totalMatches: runningMatchIndex,
    }
  }, [normalizedKeyword, numPages, pageTextItems])

  const customTextRenderer = useCallback(
    (item: CustomTextRenderPayload) => {
      const itemIndex = typeof item.itemIndex === 'number' ? item.itemIndex : -1
      const text = typeof item.str === 'string' ? item.str : ''
      const pageNumber = typeof item.pageNumber === 'number' ? item.pageNumber : -1
      const itemMatches =
        itemIndex >= 0 && pageNumber > 0
          ? matchesData.matchesByPage[pageNumber]?.[itemIndex]
          : undefined

      return renderHighlightedText(text, itemMatches)
    },
    [matchesData.matchesByPage]
  )

  useEffect(() => {
    handledNavigationTokenRef.current = null
    previousKeywordRef.current = ''
    setCurrentMatchIndex(-1)
    setNumPages(0)
    setPageTextItems({})
  }, [fileUrl])

  useEffect(() => {
    const hasKeywordChanged = previousKeywordRef.current !== normalizedKeyword
    previousKeywordRef.current = normalizedKeyword

    if (!normalizedKeyword || matchesData.totalMatches === 0) {
      setCurrentMatchIndex(-1)
      return
    }

    setCurrentMatchIndex((previousMatchIndex) => {
      if (hasKeywordChanged || previousMatchIndex < 0) {
        return 0
      }

      return Math.min(previousMatchIndex, matchesData.totalMatches - 1)
    })
  }, [normalizedKeyword, matchesData.totalMatches])

  useEffect(() => {
    if (!navigationRequest || navigationRequest.token === handledNavigationTokenRef.current) {
      return
    }

    handledNavigationTokenRef.current = navigationRequest.token

    if (matchesData.totalMatches === 0) {
      setCurrentMatchIndex(-1)
      return
    }

    setCurrentMatchIndex((previousMatchIndex) => {
      const safeCurrentIndex = previousMatchIndex >= 0 ? previousMatchIndex : 0

      if (navigationRequest.action === 'jump') {
        const targetMatch = navigationRequest.targetMatchIndex ?? 0
        return Math.max(0, Math.min(targetMatch, matchesData.totalMatches - 1))
      }

      if (navigationRequest.action === 'next') {
        return (safeCurrentIndex + 1) % matchesData.totalMatches
      }

      return (safeCurrentIndex - 1 + matchesData.totalMatches) % matchesData.totalMatches
    })
  }, [matchesData.totalMatches, navigationRequest])

  useEffect(() => {
    onSearchStateChange?.({
      totalMatches: matchesData.totalMatches,
      currentMatchIndex:
        matchesData.totalMatches > 0 && currentMatchIndex >= 0 ? currentMatchIndex : -1,
    })
  }, [currentMatchIndex, matchesData.totalMatches, onSearchStateChange])

  useEffect(() => {
    const container = viewportRef.current

    if (!container) {
      return
    }

    const highlightedElements = container.querySelectorAll('.pdf-search-match-active')
    highlightedElements.forEach((element) => {
      element.classList.remove('pdf-search-match-active')
    })

    if (currentMatchIndex < 0) {
      return
    }

    const activeElement = container.querySelector(`[data-pdf-match-index="${currentMatchIndex}"]`)

    if (!(activeElement instanceof HTMLElement)) {
      return
    }

    activeElement.classList.add('pdf-search-match-active')
    activeElement.scrollIntoView({
      block: 'center',
      inline: 'nearest',
      behavior: 'smooth',
    })
  }, [currentMatchIndex, matchesData.totalMatches, normalizedKeyword])

  useEffect(() => {
    const container = viewportRef.current

    if (!container) {
      return
    }

    const updatePageWidth = () => {
      const nextWidth = Math.floor(container.clientWidth - 24)
      if (nextWidth > 0) {
        setPageWidth(nextWidth)
      }
    }

    updatePageWidth()

    if (typeof ResizeObserver === 'undefined') {
      return
    }

    const resizeObserver = new ResizeObserver(() => {
      updatePageWidth()
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const handlePageTextSuccess = (pageNumber: number, payload: TextLayerSuccessPayload) => {
    const nextPageItems = extractTextItems(payload.items)

    setPageTextItems((previousPageTextItems) => {
      const currentPageItems = previousPageTextItems[pageNumber]

      if (
        currentPageItems &&
        currentPageItems.length === nextPageItems.length &&
        currentPageItems.every((item, itemIndex) => item === nextPageItems[itemIndex])
      ) {
        return previousPageTextItems
      }

      return {
        ...previousPageTextItems,
        [pageNumber]: nextPageItems,
      }
    })
  }

  const handleDocumentLoadSuccess = (pdf: PDFDocumentProxy) => {
    setNumPages(pdf.numPages)
    onDocumentLoad?.()
  }

  if (!fileUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-bg-white text-body-sm text-txt-black-500">
        Tiada dokumen untuk dipaparkan.
      </div>
    )
  }

  return (
    <div ref={viewportRef} className="h-full w-full overflow-auto p-3">
      <Document
        file={fileUrl}
        onLoadSuccess={handleDocumentLoadSuccess}
        loading={
          <div className="flex w-full items-center justify-center py-8 text-body-sm text-txt-black-500">
            Dokumen sedang dimuatkan...
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          {Array.from({ length: numPages }, (_, pageIndex) => {
            const pageNumber = pageIndex + 1
            return (
              <div
                key={pageNumber}
                className="mx-auto w-fit rounded-md border border-otl-gray-200 bg-bg-white"
              >
                <Page
                  pageNumber={pageNumber}
                  width={pageWidth}
                  renderTextLayer
                  renderAnnotationLayer
                  onGetTextSuccess={(textContent) =>
                    handlePageTextSuccess(pageNumber, textContent as TextLayerSuccessPayload)
                  }
                  customTextRenderer={customTextRenderer}
                />
              </div>
            )
          })}
        </div>
      </Document>
    </div>
  )
}
