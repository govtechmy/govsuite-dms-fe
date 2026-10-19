import { Tag } from '@govtechmy/myds-react/tag'
import { clx } from '@govtechmy/myds-react/utils'
import { useEffect, useRef } from 'react'
import type { PdfMatchPage } from '@/components/shared/PdfJsDocumentViewer'

interface MatchPageSearchProps {
  matchPages: PdfMatchPage[]
  totalMatches: number
  activeMatchIndex: number
  isLoading: boolean
  onSelect: (firstMatchIndex: number) => void
}

export default function MatchPageSearch({
  matchPages,
  totalMatches,
  activeMatchIndex,
  isLoading,
  onSelect,
}: MatchPageSearchProps) {
  const activeItemRef = useRef<HTMLButtonElement>(null)

  const activePage = matchPages.find(
    (matchPage) =>
      activeMatchIndex >= matchPage.firstMatchIndex &&
      activeMatchIndex < matchPage.firstMatchIndex + matchPage.matchCount
  )?.page

  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activePage])

  return (
    <div className="flex h-full max-h-[320px] w-full flex-col gap-3 rounded-xl border border-otl-gray-200 bg-bg-dialog p-4 shadow-sm md:max-h-none">
      <p className="text-sm font-medium leading-5 tracking-normal text-txt-black-900">
        {isLoading ? 'Perkataan ditemui' : `${totalMatches} perkataan ditemui`}
      </p>

      {isLoading ? (
        <p className="text-body-sm text-txt-black-500">Dokumen sedang dimuatkan...</p>
      ) : matchPages.length === 0 ? (
        <p className="text-body-sm text-txt-black-500">
          Tiada perkataan ditemui dalam dokumen ini.
        </p>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
          {matchPages.map((matchPage, index) => {
            const isActive = matchPage.page === activePage
            return (
              <button
                key={matchPage.page}
                ref={isActive ? activeItemRef : undefined}
                type="button"
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onSelect(matchPage.firstMatchIndex)}
                className={clx(
                  'flex w-full shrink-0 flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-primary',
                  isActive
                    ? 'border-otl-primary-200 bg-bg-primary-50'
                    : 'border-otl-gray-200 hover:bg-bg-washed'
                )}
              >
                <span className="text-body-sm font-semibold text-txt-black-900">
                  Tindakan {index + 1}
                </span>
                <Tag mode="pill" size="small">
                  Muka surat {matchPage.page}
                </Tag>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
