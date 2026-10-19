import { Button } from '@govtechmy/myds-react/button'
import { ChevronLeftIcon, ChevronRightIcon } from '@govtechmy/myds-react/icon'

interface SearchInPdfProps {
  searchKeyword: string
  currentMatchIndex: number
  totalMatches: number
  onPreviousMatch: () => void
  onNextMatch: () => void
  isPdfLoaded: boolean
  isIndexing: boolean
}

export default function SearchInPdf({
  searchKeyword,
  currentMatchIndex,
  totalMatches,
  onPreviousMatch,
  onNextMatch,
  isPdfLoaded,
  isIndexing,
}: SearchInPdfProps) {
  const trimmedKeyword = searchKeyword.trim()
  const isNavigationDisabled = !isPdfLoaded || !trimmedKeyword || totalMatches === 0

  const displayText = !trimmedKeyword
    ? ''
    : !isPdfLoaded || isIndexing
      ? 'Dokumen sedang dimuatkan...'
      : totalMatches > 0
        ? `${currentMatchIndex + 1} daripada ${totalMatches} perkataan “${trimmedKeyword}” ditemui`
        : `Tiada perkataan “${trimmedKeyword}” ditemui`

  return (
    <div className="flex w-full items-center gap-3">
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="default-outline"
          size="small"
          iconOnly
          aria-label="Perkataan sebelum"
          onClick={onPreviousMatch}
          disabled={isNavigationDisabled}
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          variant="default-outline"
          size="small"
          iconOnly
          aria-label="Perkataan seterusnya"
          onClick={onNextMatch}
          disabled={isNavigationDisabled}
        >
          <ChevronRightIcon />
        </Button>
      </div>
      {displayText && (
        <p className="min-w-0 truncate text-xs font-medium leading-[18px] tracking-normal text-txt-black-700" aria-live="polite">
          {displayText}
        </p>
      )}
    </div>
  )
}
