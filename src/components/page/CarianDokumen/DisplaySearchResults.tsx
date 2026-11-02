import { useSearchParams } from 'react-router-dom'
import FullTextSearchResults from './FullTextSearchResults'
import HybridSearchResults from './HybridSearchResults'
import { SEARCH_MODE, SEARCH_MODE_PARAM } from './searchMode'

interface DisplaySearchResultsProps {
  onLazyLoad: () => void
}

export default function DisplaySearchResults({ onLazyLoad }: DisplaySearchResultsProps) {
  const [searchParams] = useSearchParams()
  const isHybridSearch = searchParams.get(SEARCH_MODE_PARAM) === SEARCH_MODE.HIBRID

  return isHybridSearch ? (
    <HybridSearchResults />
  ) : (
    <FullTextSearchResults onLazyLoad={onLazyLoad} />
  )
}
