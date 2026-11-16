import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { apiAuthHeaders } from '@/services/http'

pdfjs.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.min.js`

type ItemMatch = {
  start: number
  end: number
  globalMatchIndex: number
}

type MatchesByPage = Record<number, Record<number, ItemMatch[]>>

type TextRange = {
  start: number
  end: number
}

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

export type PdfPageNavigationRequest = {
  page: number
  token: number
}

export type PdfHighlightPassage = {
  page: number
  text: string
}

interface PdfJsDocumentViewerProps {
  fileUrl: string
  searchKeyword?: string
  navigationRequest?: PdfSearchNavigationRequest | null
  pageNavigationRequest?: PdfPageNavigationRequest | null
  highlightPassage?: PdfHighlightPassage | null
  onSearchStateChange?: (state: PdfSearchState) => void
  onDocumentLoad?: () => void
  onPageChange?: (currentPage: number, totalPages: number) => void
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

const renderHighlightedText = (
  text: string,
  matches?: ItemMatch[],
  passageRanges?: TextRange[]
) => {
  if (!matches || matches.length === 0) {
    if (!passageRanges || passageRanges.length === 0) {
      return escapeHtml(text)
    }

    let passageCursor = 0
    let passageResult = ''

    for (const range of passageRanges) {
      passageResult += escapeHtml(text.slice(passageCursor, range.start))
      passageResult += `<mark class="pdf-passage-match" data-pdf-passage-match="true">${escapeHtml(
        text.slice(range.start, range.end)
      )}</mark>`
      passageCursor = range.end
    }

    passageResult += escapeHtml(text.slice(passageCursor))
    return passageResult
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

// ---------------------------------------------------------------------------
// FUZZY PASSAGE MATCHING (approximate, not exact)
// ---------------------------------------------------------------------------
// Passage text (e.g. a search snippet) rarely matches the PDF text layer
// character-for-character: words get split across items, whitespace and
// quotes differ, OCR introduces noise, and the backend may join lines from
// different parts of the page in a different order. So the passage is located
// approximately rather than with a plain string search:
//
//   1. Normalise  – keep only letters and digits, lowercased (NFKC), on both
//                   the passage and the page text.
//   2. Exact try  – if the normalised passage appears as-is, use that.
//   3. Chunk      – otherwise split the passage into fixed-size chunks and look
//                   for each chunk on the page independently.
//   4. Cluster    – group found chunks that sit close together on the page and
//                   discard lone chunks (likely coincidental matches).
//   5. Threshold  – accept only if the clusters cover enough of the passage.
//   6. Map back   – translate normalised positions back to text-layer items and
//                   widen the edges to whole words for a clean highlight.
//
// Because of this, the highlight may be slightly shorter/longer than the
// snippet, or absent if the page text differs too much.

// Size of each piece the passage is split into for partial matching.
const PASSAGE_CHUNK_LENGTH = 20
// A cluster needs at least this many found chunks to count as a real match.
const PASSAGE_MIN_CLUSTER_CHUNKS = 2
// Fraction of the passage that must be found before anything is highlighted.
const PASSAGE_MIN_COVERAGE = 0.6
const NON_ALPHANUMERIC_PATTERN = /[^\p{L}\p{N}]/u

// Fuzzy step 1: reduce text to comparable characters only (letters/digits,
// lowercased) so spacing, punctuation and quote styles are ignored.
const normalizePassageChars = (value: string) =>
  Array.from(value.normalize('NFKC').toLocaleLowerCase()).filter(
    (char) => !NON_ALPHANUMERIC_PATTERN.test(char)
  )

// Fuzzy steps 2–5: find where the (already normalised) passage sits inside the
// (already normalised) page text. Returns ranges in normalised-text positions.
const findPassageRanges = (pageText: string, passage: string): TextRange[] => {
  // Fuzzy step 2: cheap exact match first; most clean PDFs succeed here.
  const exactIndex = pageText.indexOf(passage)
  if (exactIndex >= 0) {
    return [{ start: exactIndex, end: exactIndex + passage.length }]
  }

  // Short passages are too ambiguous to match partially.
  if (passage.length < PASSAGE_CHUNK_LENGTH * PASSAGE_MIN_CLUSTER_CHUNKS) {
    return []
  }

  // Fuzzy step 3: search each chunk on its own, so noise in one part of the
  // passage doesn't prevent the rest from matching.
  const foundChunks: TextRange[] = []
  for (let offset = 0; offset < passage.length; offset += PASSAGE_CHUNK_LENGTH) {
    const chunk = passage.slice(offset, offset + PASSAGE_CHUNK_LENGTH)
    const chunkIndex = chunk.length === PASSAGE_CHUNK_LENGTH ? pageText.indexOf(chunk) : -1
    if (chunkIndex >= 0) {
      foundChunks.push({ start: chunkIndex, end: chunkIndex + chunk.length })
    }
  }
  foundChunks.sort((first, second) => first.start - second.start)

  // Fuzzy step 4: chunks at most one chunk apart belong to the same cluster; lone chunks are
  // treated as coincidental matches elsewhere on the page and ignored.
  const clusters: { range: TextRange; chunkCount: number }[] = []
  for (const chunk of foundChunks) {
    const lastCluster = clusters[clusters.length - 1]
    if (lastCluster && chunk.start - lastCluster.range.end <= PASSAGE_CHUNK_LENGTH) {
      lastCluster.range.end = Math.max(lastCluster.range.end, chunk.end)
      lastCluster.chunkCount += 1
    } else {
      clusters.push({ range: { ...chunk }, chunkCount: 1 })
    }
  }

  // Fuzzy step 5: only highlight if enough of the passage was found; otherwise
  // the match is too weak to trust and nothing is highlighted.
  const keptClusters = clusters.filter(
    (cluster) => cluster.chunkCount >= PASSAGE_MIN_CLUSTER_CHUNKS
  )
  const matchedLength = keptClusters.reduce(
    (total, cluster) => total + cluster.chunkCount * PASSAGE_CHUNK_LENGTH,
    0
  )

  return matchedLength >= passage.length * PASSAGE_MIN_COVERAGE
    ? keptClusters.map((cluster) => cluster.range)
    : []
}

// Entry point for fuzzy passage matching on one page. Returns, per text-layer
// item index, the character ranges to wrap in <mark>, or null if no match.
const findPassageItemRanges = (
  pageItems: string[],
  passage: string
): Record<number, TextRange[]> | null => {
  const normalizedPassage = normalizePassageChars(passage).join('')
  if (!normalizedPassage) {
    return null
  }

  // Build the normalised page text, remembering for every kept character which
  // item and offset it came from, so fuzzy matches can be mapped back later.
  let pageText = ''
  const sourcePositions: { itemIndex: number; offset: number }[] = []

  pageItems.forEach((itemText, itemIndex) => {
    Array.from(itemText).forEach((char, offset) => {
      normalizePassageChars(char).forEach((normalizedChar) => {
        pageText += normalizedChar
        sourcePositions.push({ itemIndex, offset })
      })
    })
  })

  const ranges = findPassageRanges(pageText, normalizedPassage)
  if (ranges.length === 0) {
    return null
  }

  // Fuzzy step 6: convert each normalised range back into original text-layer
  // item ranges (a single match may span several items).
  const itemRanges: Record<number, TextRange[]> = {}

  for (const range of ranges) {
    const rangeByItem: Record<number, TextRange> = {}
    for (let index = range.start; index < range.end; index += 1) {
      const { itemIndex, offset } = sourcePositions[index]
      const itemRange = rangeByItem[itemIndex]
      rangeByItem[itemIndex] = itemRange
        ? { start: itemRange.start, end: offset + 1 }
        : { start: offset, end: offset + 1 }
    }

    // Chunk matches can start or stop mid-word; widen the edges to whole words.
    const firstItem = sourcePositions[range.start]
    const lastItem = sourcePositions[range.end - 1]
    const firstText = pageItems[firstItem.itemIndex]
    const lastText = pageItems[lastItem.itemIndex]
    const wordStart = firstText.slice(0, firstItem.offset).search(/\S+$/)
    const wordEnd = lastText.slice(lastItem.offset).search(/\s/)

    if (wordStart >= 0) {
      rangeByItem[firstItem.itemIndex].start = wordStart
    }
    rangeByItem[lastItem.itemIndex].end = wordEnd >= 0 ? lastItem.offset + wordEnd : lastText.length

    Object.entries(rangeByItem).forEach(([itemIndex, itemRange]) => {
      const index = Number(itemIndex)
      itemRanges[index] = [...(itemRanges[index] ?? []), itemRange]
    })
  }

  // Word-widened ranges from neighbouring clusters may overlap within an item.
  Object.values(itemRanges).forEach((rangesInItem) => {
    rangesInItem.sort((first, second) => first.start - second.start)
    for (let index = rangesInItem.length - 1; index > 0; index -= 1) {
      if (rangesInItem[index].start <= rangesInItem[index - 1].end) {
        rangesInItem[index - 1].end = Math.max(rangesInItem[index - 1].end, rangesInItem[index].end)
        rangesInItem.splice(index, 1)
      }
    }
  })

  return itemRanges
}

export default function PdfJsDocumentViewer({
  fileUrl,
  searchKeyword = '',
  navigationRequest,
  pageNavigationRequest,
  highlightPassage,
  onSearchStateChange,
  onDocumentLoad,
  onPageChange,
}: PdfJsDocumentViewerProps) {
  const [numPages, setNumPages] = useState(0)
  const [pageTextItems, setPageTextItems] = useState<Record<number, string[]>>({})
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1)
  const [pageWidth, setPageWidth] = useState<number | undefined>()
  const [currentPageNumber, setCurrentPageNumber] = useState(1)
  const [hasIndexingTimedOut, setHasIndexingTimedOut] = useState(false)
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({})
  // Bumped whenever a page's text layer finishes rendering (marks are
  // injected asynchronously by react-pdf), so the highlight/scroll effect
  // below can retry once the target <mark> actually exists in the DOM.
  const [textLayerRenderTick, setTextLayerRenderTick] = useState(0)
  const handledNavigationTokenRef = useRef<number | null>(null)
  const handledPageNavigationTokenRef = useRef<number | null>(null)
  // While a programmatic page-navigation scroll is animating, the
  // IntersectionObserver below fires with intermediate pages still holding
  // the highest visibility ratio (e.g. page 6 briefly "wins" again while
  // scrolling towards page 7). Suppress those intermediate updates so the
  // page number advances straight to the target instead of flickering.
  const pendingPageScrollTargetRef = useRef<number | null>(null)
  const previousKeywordRef = useRef('')
  const lastEmittedSearchStateRef = useRef<PdfSearchState | null>(null)
  const lastActiveMatchElementsRef = useRef<HTMLElement[]>([])
  const lastNavigationActionRef = useRef<PdfSearchNavigationRequest['action'] | null>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const handledPassageKeyRef = useRef<string | null>(null)

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

  const passagePage = highlightPassage?.page
  const passageText = highlightPassage?.text
  const passagePageItems = passagePage ? pageTextItems[passagePage] : undefined
  // Fuzzy-matched passage highlight ranges for the target page (see
  // findPassageItemRanges); recomputed only when that page's text or the passage changes.
  const passageItemRanges = useMemo(() => {
    if (!passageText || !passagePageItems || passagePageItems.length === 0) {
      return null
    }

    return findPassageItemRanges(passagePageItems, passageText)
  }, [passagePageItems, passageText])

  const customTextRenderer = useCallback(
    (item: CustomTextRenderPayload) => {
      const itemIndex = typeof item.itemIndex === 'number' ? item.itemIndex : -1
      const text = typeof item.str === 'string' ? item.str : ''
      const pageNumber = typeof item.pageNumber === 'number' ? item.pageNumber : -1
      const itemMatches =
        itemIndex >= 0 && pageNumber > 0
          ? matchesData.matchesByPage[pageNumber]?.[itemIndex]
          : undefined
      const itemPassageRanges =
        itemIndex >= 0 && pageNumber === passagePage ? passageItemRanges?.[itemIndex] : undefined

      return renderHighlightedText(text, itemMatches, itemPassageRanges)
    },
    [matchesData.matchesByPage, passageItemRanges, passagePage]
  )

  useEffect(() => {
    handledNavigationTokenRef.current = null
    handledPageNavigationTokenRef.current = null
    pendingPageScrollTargetRef.current = null
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
    setCurrentPageNumber(1)
    setHasIndexingTimedOut(false)
    pageRefs.current = {}
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

  const isIndexing =
    !hasIndexingTimedOut && (numPages === 0 || Object.keys(pageTextItems).length < numPages)

  // Pages have no height until they are laid out, so wait for indexing to
  // finish before scrolling; otherwise the jump lands near the first page.
  useEffect(() => {
    if (
      !pageNavigationRequest ||
      pageNavigationRequest.token === handledPageNavigationTokenRef.current ||
      numPages === 0 ||
      isIndexing
    ) {
      return
    }

    handledPageNavigationTokenRef.current = pageNavigationRequest.token

    const targetPage = Math.max(1, Math.min(pageNavigationRequest.page, numPages))
    const targetPageElement = pageRefs.current[targetPage]

    if (!targetPageElement) {
      return
    }

    pendingPageScrollTargetRef.current = targetPage
    targetPageElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setCurrentPageNumber(targetPage)

    // Fallback in case the target page never reports the highest
    // intersection ratio (e.g. it's the last page and can't fill the
    // viewport), so the suppression doesn't get stuck indefinitely.
    const releaseTimeoutId = setTimeout(() => {
      if (pendingPageScrollTargetRef.current === targetPage) {
        pendingPageScrollTargetRef.current = null
      }
    }, 1000)

    return () => clearTimeout(releaseTimeoutId)
  }, [pageNavigationRequest, numPages, isIndexing])

  // Some documents contain pages whose text extraction never resolves, which
  // would otherwise leave isIndexing true forever. Force-complete indexing
  // 5 seconds after the document has loaded.
  useEffect(() => {
    if (numPages === 0 || !isIndexing) {
      return
    }

    const timeoutId = setTimeout(() => setHasIndexingTimedOut(true), 5000)
    return () => clearTimeout(timeoutId)
  }, [numPages, isIndexing])

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

  // Scroll the highlighted passage into view once per passage, after layout has
  // settled (indexing done) and its text layer has rendered the <mark>s.
  useEffect(() => {
    const container = viewportRef.current
    if (!container || !passageItemRanges || !passagePage || isIndexing) {
      return
    }

    const passageKey = `${fileUrl}|${passagePage}|${passageText}`
    if (handledPassageKeyRef.current === passageKey) {
      return
    }

    const firstPassageElement = pageRefs.current[passagePage]?.querySelector(
      '[data-pdf-passage-match]'
    )
    if (!(firstPassageElement instanceof HTMLElement)) {
      return
    }

    handledPassageKeyRef.current = passageKey
    firstPassageElement.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' })
  }, [fileUrl, isIndexing, passageItemRanges, passagePage, passageText, textLayerRenderTick])

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

  const handlePageTextError = (pageNumber: number) => {
    setPageTextItems((previousPageTextItems) => {
      if (pageNumber in previousPageTextItems) {
        return previousPageTextItems
      }

      return {
        ...previousPageTextItems,
        [pageNumber]: [],
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

  useEffect(() => {
    const container = viewportRef.current

    if (!container || numPages === 0) {
      return
    }

    const visibilityByPage = new Map<number, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const pageNumber = Number(entry.target.getAttribute('data-page-number'))
          if (!pageNumber) {
            return
          }
          visibilityByPage.set(pageNumber, entry.intersectionRatio)
        })

        let mostVisiblePage = 0
        let highestRatio = 0
        visibilityByPage.forEach((ratio, pageNumber) => {
          if (ratio > highestRatio) {
            highestRatio = ratio
            mostVisiblePage = pageNumber
          }
        })

        if (mostVisiblePage > 0) {
          const pendingTarget = pendingPageScrollTargetRef.current

          if (pendingTarget !== null) {
            // While a programmatic page-navigation scroll is still in
            // flight, ignore intermediate pages and only commit once the
            // target page actually becomes the most visible one.
            if (mostVisiblePage === pendingTarget) {
              pendingPageScrollTargetRef.current = null
              setCurrentPageNumber(mostVisiblePage)
            }
          } else {
            setCurrentPageNumber(mostVisiblePage)
          }
        }
      },
      {
        root: null,
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    )

    Object.values(pageRefs.current).forEach((pageElement) => {
      if (pageElement) {
        observer.observe(pageElement)
      }
    })

    return () => observer.disconnect()
  }, [numPages, pageWidth])

  useEffect(() => {
    onPageChange?.(currentPageNumber, numPages)
  }, [currentPageNumber, numPages, onPageChange])

  // Stable per URL so react-pdf doesn't reload the document when the component re-renders.
  const pdfFile = useMemo(() => ({ url: fileUrl, httpHeaders: apiAuthHeaders() }), [fileUrl])

  if (!fileUrl) {
    return (
      <div className="flex w-full items-center justify-center bg-bg-white py-12 text-body-sm text-txt-black-500">
        Tiada dokumen untuk dipaparkan.
      </div>
    )
  }

  return (
    <div ref={viewportRef} className="w-full p-3">
      <Document
        file={pdfFile}
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
                ref={(pageElement) => {
                  pageRefs.current[pageNumber] = pageElement
                }}
                data-page-number={pageNumber}
                className="mx-auto w-fit overflow-hidden rounded-md border border-otl-gray-200 bg-bg-white"
              >
                <Page
                  pageNumber={pageNumber}
                  width={pageWidth}
                  renderTextLayer
                  renderAnnotationLayer
                  onGetTextSuccess={(textContent) =>
                    handlePageTextSuccess(pageNumber, textContent as TextLayerSuccessPayload)
                  }
                  onGetTextError={() => handlePageTextError(pageNumber)}
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
