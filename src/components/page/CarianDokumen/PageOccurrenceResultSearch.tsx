import { useEffect, useState } from 'react'
import OccurrenceResultList from './OccurrenceResultList'
import PageOccurrenceList from './PageOccurrenceList'

export interface PageOccurrenceItem {
  pageNumber: number
  occurrences: number
  title: string
  location: string
}

// TODO: replace with API data once the endpoint is available
const PAGE_OCCURRENCE_ITEMS: PageOccurrenceItem[] = [
  {
    pageNumber: 1,
    occurrences: 1,
    title: 'Agenda Mesyuarat JPICT Bil 1/2026',
    location: 'pdf/x/y/z',
  },
  {
    pageNumber: 4,
    occurrences: 9,
    title: 'Agenda Mesyuarat JPICT Bil 1/2026',
    location: 'pdf/x/y/z',
  },
  {
    pageNumber: 5,
    occurrences: 7,
    title: 'Agenda Mesyuarat JPICT Bil 1/2026',
    location: 'pdf/x/y/z',
  },
  {
    pageNumber: 6,
    occurrences: 5,
    title: 'Agenda Mesyuarat JPICT Bil 1/2026',
    location: 'pdf/x/y/z',
  },
  {
    pageNumber: 7,
    occurrences: 5,
    title: 'Agenda Mesyuarat JPICT Bil 1/2026',
    location: 'pdf/x/y/z',
  },
  {
    pageNumber: 8,
    occurrences: 4,
    title: 'Agenda Mesyuarat JPICT Bil 1/2026',
    location: 'pdf/x/y/z',
  },
  {
    pageNumber: 9,
    occurrences: 6,
    title: 'Agenda Mesyuarat JPICT Bil 1/2026',
    location: 'pdf/x/y/z',
  },
  {
    pageNumber: 10,
    occurrences: 4,
    title: 'Agenda Mesyuarat JPICT Bil 1/2026',
    location: 'pdf/x/y/z',
  },
  {
    pageNumber: 11,
    occurrences: 6,
    title: 'Agenda Mesyuarat JPICT Bil 1/2026',
    location: 'pdf/x/y/z',
  },
  {
    pageNumber: 12,
    occurrences: 4,
    title: 'Agenda Mesyuarat JPICT Bil 1/2026',
    location: 'pdf/x/y/z',
  },
]

const SIMULATED_FETCH_DELAY_MS = 2000

// TODO: replace with the single-page PDF API call using item.location
async function simulateFetchPage(item: PageOccurrenceItem): Promise<PageOccurrenceItem> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_FETCH_DELAY_MS))
  return item
}

export default function PageOccurrenceResultSearch() {
  const [pendingPages, setPendingPages] = useState<PageOccurrenceItem[]>(PAGE_OCCURRENCE_ITEMS)
  const [loadedPages, setLoadedPages] = useState<PageOccurrenceItem[]>([])
  const [fetchingPageNumber, setFetchingPageNumber] = useState<number | null>(null)
  const [failedPageNumbers, setFailedPageNumbers] = useState<number[]>([])
  const [selectedOccurrence, setSelectedOccurrence] = useState<number | null>(null)
  const [totalOccurrences] = useState(() =>
    PAGE_OCCURRENCE_ITEMS.reduce((sum, item) => sum + item.occurrences, 0)
  )

  useEffect(() => {
    let isCancelled = false

    const fetchPagesSequentially = async () => {
      for (const item of PAGE_OCCURRENCE_ITEMS) {
        if (isCancelled) return
        setFetchingPageNumber(item.pageNumber)

        try {
          const page = await simulateFetchPage(item)
          if (isCancelled) return
          setLoadedPages((previous) => [...previous, page])
          setPendingPages((previous) =>
            previous.filter((pending) => pending.pageNumber !== item.pageNumber)
          )
        } catch {
          if (isCancelled) return
          setFailedPageNumbers((previous) => [...previous, item.pageNumber])
        }
      }

      if (!isCancelled) setFetchingPageNumber(null)
    }

    void fetchPagesSequentially()

    return () => {
      isCancelled = true
    }
  }, [])

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-body-md font-semibold text-txt-black-900">
        {totalOccurrences} Perkataan Ditemui
      </p>

      <OccurrenceResultList
        pages={loadedPages}
        isFetching={pendingPages.length > failedPageNumbers.length}
        selectedOccurrence={selectedOccurrence}
        onOccurrenceSelect={setSelectedOccurrence}
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
