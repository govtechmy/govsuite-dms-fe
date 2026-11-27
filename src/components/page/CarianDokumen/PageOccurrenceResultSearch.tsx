import { Spinner } from '@govtechmy/myds-react/spinner'
import { useEffect, useState } from 'react'
import { getRecordPagesByKeyword, type RecordKeywordPage } from '@/services/catalog.svc'
import { getRecordViewPages } from '@/services/getRecordInfo.svc'
import OccurrenceResultList from './OccurrenceResultList'
import PageOccurrenceList from './PageOccurrenceList'

export interface OccurrenceSnippet {
  before: string
  match: string
  after: string
}

export interface PageOccurrenceItem {
  pageNumber: number
  occurrences: number
  searchText: string
  recordPageUrl: string
  snippets: OccurrenceSnippet[]
}

export interface OccurrenceSelection {
  recordId: string
  query: string
  occurrence: number
  occurrenceInPage: number
  pageNumber: number
  pageUrl: string
}

interface PageOccurrenceResultSearchProps {
  recordId: string
  query: string
  selectedOccurrence: number | null
  onOccurrenceSelect: (selection: OccurrenceSelection) => void
}

// Short leading context keeps the matched word visible in a single truncated row.
const SNIPPET_BEFORE_LENGTH = 15
const SNIPPET_AFTER_LENGTH = 40

// Mirrors the backend occurrence pattern: case-insensitive, whole-word, flexible whitespace.
function extractSnippets(html: string, query: string): OccurrenceSnippet[] {
  // Join text nodes with spaces: adjacent block elements otherwise merge words ("MALAYSIAAkta").
  const body = new DOMParser().parseFromString(html, 'text/html').body
  const walker = body.ownerDocument.createTreeWalker(body, NodeFilter.SHOW_TEXT)
  const textParts: string[] = []
  while (walker.nextNode()) textParts.push(walker.currentNode.textContent ?? '')
  const text = textParts.join(' ').replace(/\s+/g, ' ').trim()
  const escapedQuery = query
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/ /g, '\\s+')
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}_])${escapedQuery}(?![\\p{L}\\p{N}_])`, 'giu')

  return Array.from(text.matchAll(pattern), (match) => {
    const start = match.index
    const end = start + match[0].length
    const beforeStart = Math.max(0, start - SNIPPET_BEFORE_LENGTH)
    const afterEnd = Math.min(text.length, end + SNIPPET_AFTER_LENGTH)

    return {
      before: `${beforeStart > 0 ? '…' : ''}${text.slice(beforeStart, start)}`,
      match: match[0],
      after: `${text.slice(end, afterEnd)}${afterEnd < text.length ? '…' : ''}`,
    }
  })
}

async function fetchAllKeywordPages(recordId: string, query: string) {
  const pages: RecordKeywordPage[] = []
  let page = 1
  let hasNextPage = true

  while (hasNextPage) {
    const response = await getRecordPagesByKeyword({ recordId, query, page })
    pages.push(...response.items)
    hasNextPage = response.meta.hasNextPage
    page += 1
  }

  return pages
}

export default function PageOccurrenceResultSearch({
  recordId,
  query,
  selectedOccurrence,
  onOccurrenceSelect,
}: PageOccurrenceResultSearchProps) {
  const [isLoadingPages, setIsLoadingPages] = useState(true)
  const [hasPagesError, setHasPagesError] = useState(false)
  const [totalOccurrences, setTotalOccurrences] = useState(0)
  const [pendingPages, setPendingPages] = useState<PageOccurrenceItem[]>([])
  const [loadedPages, setLoadedPages] = useState<PageOccurrenceItem[]>([])
  const [fetchingPageNumber, setFetchingPageNumber] = useState<number | null>(null)
  const [failedPageNumbers, setFailedPageNumbers] = useState<number[]>([])
  const isFetching = isLoadingPages || pendingPages.length > failedPageNumbers.length

  useEffect(() => {
    let isCancelled = false

    const fetchOccurrences = async () => {
      let items: PageOccurrenceItem[]

      try {
        const keywordPages = await fetchAllKeywordPages(recordId, query)
        if (isCancelled) return

        items = keywordPages.map((page) => ({
          pageNumber: page.pageNumber,
          occurrences: page.occurrences,
          searchText: query,
          recordPageUrl: '',
          snippets: [],
        }))
        setTotalOccurrences(items.reduce((sum, item) => sum + item.occurrences, 0))
        setPendingPages(items)
      } catch {
        if (!isCancelled) setHasPagesError(true)
        return
      } finally {
        if (!isCancelled) setIsLoadingPages(false)
      }

      let hasAutoSelected = false

      for (const item of items) {
        if (isCancelled) return
        setFetchingPageNumber(item.pageNumber)

        try {
          const [viewPage] = await getRecordViewPages(recordId, [item.pageNumber])
          if (isCancelled) return
          if (!viewPage) throw new Error(`Page ${item.pageNumber} not found`)

          const loadedPage: PageOccurrenceItem = {
            ...item,
            recordPageUrl: viewPage.recordPageUrl,
            snippets: extractSnippets(viewPage.contentEditor, query),
          }
          setLoadedPages((previous) => [...previous, loadedPage])
          setPendingPages((previous) =>
            previous.filter((pending) => pending.pageNumber !== item.pageNumber)
          )

          if (!hasAutoSelected && loadedPage.occurrences > 0) {
            hasAutoSelected = true
            onOccurrenceSelect({
              recordId,
              query,
              occurrence: 1,
              occurrenceInPage: 1,
              pageNumber: loadedPage.pageNumber,
              pageUrl: loadedPage.recordPageUrl,
            })
          }
        } catch {
          if (isCancelled) return
          setFailedPageNumbers((previous) => [...previous, item.pageNumber])
        }
      }

      if (!isCancelled) setFetchingPageNumber(null)
    }

    void fetchOccurrences()

    return () => {
      isCancelled = true
    }
  }, [recordId, query, onOccurrenceSelect])

  // Occurrences are numbered across loaded pages in page order; map back to the owning page.
  const handleOccurrenceSelect = (occurrence: number) => {
    let remaining = occurrence

    for (const page of loadedPages) {
      if (remaining <= page.occurrences) {
        onOccurrenceSelect({
          recordId,
          query,
          occurrence,
          occurrenceInPage: remaining,
          pageNumber: page.pageNumber,
          pageUrl: page.recordPageUrl,
        })
        return
      }
      remaining -= page.occurrences
    }
  }

  return (
    <div className="flex w-full flex-col gap-3 lg:min-h-0 lg:flex-1">
      <div className="flex items-center gap-2 justify-between">
        <p className="text-body-md font-semibold text-txt-black-900">
          {isLoadingPages || hasPagesError
            ? 'Perkataan Ditemui'
            : `${totalOccurrences} Perkataan Ditemui`}
        </p>
        {isFetching && (
          <div className="pr-3">
            <Spinner size="small" />
          </div>
        )}
      </div>

      <OccurrenceResultList
        pages={loadedPages}
        isFetching={isFetching}
        hasError={hasPagesError}
        selectedOccurrence={selectedOccurrence}
        onOccurrenceSelect={handleOccurrenceSelect}
      />

      {pendingPages.length > 0 && (
        <PageOccurrenceList
          items={pendingPages}
          fetchingPageNumber={fetchingPageNumber}
          failedPageNumbers={failedPageNumbers}
        />
      )}
    </div>
  )
}
