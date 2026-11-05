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
        ? `${currentMatchIndex + 1} daripada ${totalMatches} perkataan "${trimmedKeyword}" ditemui dalam dokumen ini`
        : 'Tiada hasil ditemui'

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <Button
        variant="default-outline"
        size="small"
        iconOnly
        aria-label="Padanan sebelumnya"
        onClick={onPreviousMatch}
        disabled={isNavigationDisabled}
      >
        <ChevronLeftIcon />
      </Button>
      <Button
        variant="default-outline"
        size="small"
        iconOnly
        aria-label="Padanan seterusnya"
        onClick={onNextMatch}
        disabled={isNavigationDisabled}
      >
        <ChevronRightIcon />
      </Button>
      {displayText && (
        <span aria-live="polite" className="ml-1 min-w-0 text-body-xs text-txt-black-700">
          {displayText}
        </span>
      )}
    </div>
  )
}
