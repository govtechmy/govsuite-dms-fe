import { clx } from '@govtechmy/myds-react/utils'

interface KeywordRecord {
  keyword: string
  dataPage: Record<string, number>[]
}

interface ExpandedKeywordItem {
  occurance: number
  keyword: string
}

interface WordsResultSearchProps {
  keywordRecords: KeywordRecord[]
  selectedKeywordId?: string | null
  onKeywordSelect?: (id: string) => void
}

export function WordsResultSearch({
  keywordRecords,
  selectedKeywordId,
  onKeywordSelect,
}: WordsResultSearchProps) {
  // Expand keyword records into individual occurrences with formatted text
  const expandKeywordRecords = (records: KeywordRecord[]): ExpandedKeywordItem[] => {
    const expanded: ExpandedKeywordItem[] = []

    records.forEach((record) => {
      let globalOccurrenceNumber = 0

      record.dataPage.forEach((pageObj) => {
        const [pageKey, count] = Object.entries(pageObj)[0]
        const pageNumber = parseInt(pageKey.replace('page', ''))

        for (let i = 0; i < count; i++) {
          globalOccurrenceNumber++
          expanded.push({
            occurance: globalOccurrenceNumber,
            keyword: `${record.keyword} ${globalOccurrenceNumber} : M/S ${pageNumber}`,
          })
        }
      })
    })

    return expanded
  }

  const expandedKeywords = expandKeywordRecords(keywordRecords)

  return (
    <div className="flex h-[172px] w-full flex-col gap-3">
      {/* Header */}
      <div className="flex w-full items-center justify-center">
        <p className="flex-1 text-body-md font-semibold text-txt-black-900">
          {expandedKeywords.length} Perkataan Ditemui
        </p>
      </div>

      {/* Keywords List */}
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-xl border border-otl-gray-200 p-2">
        <div className="flex flex-col gap-0 overflow-y-auto">
          {expandedKeywords.map((item) => {
            const itemId = `${item.occurance}`
            return (
              <button
                key={itemId}
                onClick={() => onKeywordSelect?.(itemId)}
                className={clx(
                  'flex w-full cursor-pointer items-center gap-2 rounded px-2.5 py-1.5 text-left transition-colors',
                  selectedKeywordId === itemId
                    ? 'bg-primary-600 text-txt-white'
                    : 'text-txt-black-900 hover:bg-bg-washed'
                )}
              >
                <p className="flex-1 truncate text-body-xs font-medium">{item.keyword}</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
