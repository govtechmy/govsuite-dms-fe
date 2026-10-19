import HybridRecordResultSearch from './HybridRecordResultSearch'
import HybridPratontonSearchResult from './HybridPratontonSearchResult'
import { useSearchStore } from '@/store/SearchStore'

export default function HybridSearchResults() {
  const searchKeyword = useSearchStore((state) => state.query)

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col items-stretch md:flex-row">
        <div className="flex min-h-0 w-full shrink-0 flex-col items-center gap-6 border-y py-6 md:h-full md:w-[360px] lg:w-[420px] md:self-stretch md:pl-6">
          <HybridRecordResultSearch />
        </div>
        <HybridPratontonSearchResult searchKeyword={searchKeyword} />
      </div>
    </div>
  )
}
