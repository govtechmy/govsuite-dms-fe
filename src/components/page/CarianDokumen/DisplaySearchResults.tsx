import { useSearchParams } from 'react-router-dom'
import FullTextSearchResults from './FullTextSearchResults'
import HybridSearchResults from './HybridSearchResults'
import { SEARCH_MODE, SEARCH_MODE_PARAM } from './searchMode'

export default function DisplaySearchResults() {
  const [searchParams] = useSearchParams()
  const isHybridSearch = searchParams.get(SEARCH_MODE_PARAM) === SEARCH_MODE.HIBRID

  return isHybridSearch ? <HybridSearchResults /> : <FullTextSearchResults />
}
