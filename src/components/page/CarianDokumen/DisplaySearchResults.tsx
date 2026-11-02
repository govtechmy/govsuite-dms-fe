import { useSearchParams } from 'react-router-dom'
import FullTextSearchResults from './FullTextSearchResults'
import { SEARCH_MODE, SEARCH_MODE_PARAM } from './searchMode'

interface DisplaySearchResultsProps {
  onLazyLoad: () => void
}

export default function DisplaySearchResults({ onLazyLoad }: DisplaySearchResultsProps) {
  const [searchParams] = useSearchParams()
  const isHybridSearch = searchParams.get(SEARCH_MODE_PARAM) === SEARCH_MODE.HIBRID

  if (isHybridSearch) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 h-full">
        <div role="status" className="text-body-sm text-txt-black-500 text-center max-w-md">
          Carian Hibrid belum tersedia.
        </div>
      </div>
    )
  }

  return <FullTextSearchResults onLazyLoad={onLazyLoad} />
}
