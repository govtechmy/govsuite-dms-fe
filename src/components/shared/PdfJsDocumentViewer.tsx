import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.min.js`

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
  isIndexing: boolean
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
  // Bumped whenever a page's text layer finishes rendering (marks are
  // injected asynchronously by react-pdf), so the highlight/scroll effect
  // below can retry once the target <mark> actually exists in the DOM.
  const [textLayerRenderTick, setTextLayerRenderTick] = useState(0)
  const handledNavigationTokenRef = useRef<number | null>(null)
  const previousKeywordRef = useRef('')
  const lastEmittedSearchStateRef = useRef<PdfSearchState | null>(null)
  const lastActiveMatchElementsRef = useRef<HTMLElement[]>([])
  const lastNavigationActionRef = useRef<PdfSearchNavigationRequest['action'] | null>(null)
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

      if (pageItems.length === 0) {
        continue
      }

      // Text can be split across items (e.g. "Hello" and "World" as separate
      // runs), so join the whole page into one string and map matches back
      // to their originating items instead of searching item-by-item.
      let fullText = ''
      const itemRanges: { start: number; end: number }[] = []

      pageItems.forEach((rawText, itemIndex) => {
        const text = rawText ?? ''

        if (fullText.length > 0 && text.length > 0) {
          const previousChar = fullText[fullText.length - 1]
          const nextChar = text[0]
          if (!/\s/.test(previousChar) && !/\s/.test(nextChar)) {
            fullText += ' '
          }
        }

        const start = fullText.length
        fullText += text
        itemRanges[itemIndex] = { start, end: fullText.length }
      })

      const normalizedFullText = fullText.toLocaleLowerCase()
      let searchPosition = 0
      let itemPointer = 0

      while (searchPosition < normalizedFullText.length) {
        const foundIndex = normalizedFullText.indexOf(normalizedKeyword, searchPosition)

        if (foundIndex < 0) {
          break
        }

        const matchStart = foundIndex
        const matchEnd = foundIndex + normalizedKeyword.length
        const globalMatchIndex = runningMatchIndex

        for (
          let currentItemIndex = itemPointer;
          currentItemIndex < itemRanges.length;
          currentItemIndex += 1
        ) {
          const itemRange = itemRanges[currentItemIndex]

          if (!itemRange || itemRange.start >= matchEnd) {
            break
          }

          if (itemRange.end <= matchStart) {
            itemPointer = currentItemIndex + 1
            continue
          }

          const localStart = Math.max(matchStart, itemRange.start) - itemRange.start
          const localEnd = Math.min(matchEnd, itemRange.end) - itemRange.start

          if (localEnd <= localStart) {
            continue
          }

          if (!matchesByPage[pageNumber]) {
            matchesByPage[pageNumber] = {}
          }
          if (!matchesByPage[pageNumber][currentItemIndex]) {
            matchesByPage[pageNumber][currentItemIndex] = []
          }
          matchesByPage[pageNumber][currentItemIndex].push({
            start: localStart,
            end: localEnd,
            globalMatchIndex,
          })
        }

        runningMatchIndex += 1
        searchPosition = matchEnd
      }
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
    lastEmittedSearchStateRef.current = null
    lastNavigationActionRef.current = null
    if (lastActiveMatchElementsRef.current.length > 0) {
      lastActiveMatchElementsRef.current.forEach((element) => {
        element.classList.remove('pdf-search-match-active')
      })
      lastActiveMatchElementsRef.current = []
    }
    setCurrentMatchIndex(-1)
    setNumPages(0)
    setPageTextItems({})
    setTextLayerRenderTick(0)
  }, [fileUrl])

  useEffect(() => {
    const hasKeywordChanged = previousKeywordRef.current !== normalizedKeyword
    previousKeywordRef.current = normalizedKeyword

    if (!normalizedKeyword || matchesData.totalMatches === 0) {
      lastNavigationActionRef.current = null
      setCurrentMatchIndex(-1)
      return
    }

    if (hasKeywordChanged) {
      lastNavigationActionRef.current = null
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
    lastNavigationActionRef.current = navigationRequest.action

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

  const isIndexing = numPages === 0 || Object.keys(pageTextItems).length < numPages

  useEffect(() => {
    const nextSearchState: PdfSearchState = {
      totalMatches: matchesData.totalMatches,
      currentMatchIndex:
        matchesData.totalMatches > 0 && currentMatchIndex >= 0 ? currentMatchIndex : -1,
      isIndexing,
    }

    const previousSearchState = lastEmittedSearchStateRef.current
    if (
      previousSearchState &&
      previousSearchState.totalMatches === nextSearchState.totalMatches &&
      previousSearchState.currentMatchIndex === nextSearchState.currentMatchIndex &&
      previousSearchState.isIndexing === nextSearchState.isIndexing
    ) {
      return
    }

    lastEmittedSearchStateRef.current = nextSearchState
    onSearchStateChange?.(nextSearchState)
  }, [currentMatchIndex, matchesData.totalMatches, isIndexing, onSearchStateChange])

  useEffect(() => {
    const container = viewportRef.current

    if (!container) {
      return
    }

    if (lastActiveMatchElementsRef.current.length > 0) {
      lastActiveMatchElementsRef.current.forEach((element) => {
        element.classList.remove('pdf-search-match-active')
      })
      lastActiveMatchElementsRef.current = []
    }

    if (currentMatchIndex < 0) {
      return
    }

    // A single match can span multiple text items, so it may render as more
    // than one <mark> element sharing the same data-pdf-match-index.
    const activeElements = Array.from(
      container.querySelectorAll(`[data-pdf-match-index="${currentMatchIndex}"]`)
    ).filter((element): element is HTMLElement => element instanceof HTMLElement)

    if (activeElements.length === 0) {
      return
    }

    activeElements.forEach((element) => element.classList.add('pdf-search-match-active'))
    lastActiveMatchElementsRef.current = activeElements
    const isManualNavigation =
      lastNavigationActionRef.current === 'next' || lastNavigationActionRef.current === 'previous'
    activeElements[0].scrollIntoView({
      block: 'center',
      inline: 'nearest',
      behavior: isManualNavigation ? 'smooth' : 'auto',
    })
    lastNavigationActionRef.current = null
  }, [currentMatchIndex, normalizedKeyword, textLayerRenderTick])

  useEffect(() => {
    const container = viewportRef.current

    if (!container) {
      return
    }

    const updatePageWidth = () => {
      const nextWidth = Math.floor(container.clientWidth - 24)
      if (nextWidth > 0) {
        setPageWidth((previousWidth) => (previousWidth === nextWidth ? previousWidth : nextWidth))
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

  const handleTextLayerRenderSuccess = useCallback(() => {
    setTextLayerRenderTick((previousTick) => previousTick + 1)
  }, [])

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
                  onRenderTextLayerSuccess={handleTextLayerRenderSuccess}
                />
              </div>
            )
          })}
        </div>
      </Document>
    </div>
  )
}
