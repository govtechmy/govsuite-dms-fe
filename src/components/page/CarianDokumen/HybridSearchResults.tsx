import HybridRecordResultSearch from './HybridRecordResultSearch'
import HybridPratontonSearchResult from './HybridPratontonSearchResult'

export default function HybridSearchResults() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col items-stretch md:flex-row">
        <HybridPratontonSearchResult />
        <div className="order-first flex min-h-0 w-full shrink-0 flex-col border-t px-4 pt-4 sm:px-6 sm:pt-6 md:order-none md:h-full md:w-[320px] md:border-y md:py-3 md:pl-0 lg:w-[360px]">
          <HybridRecordResultSearch />
        </div>
      </div>
    </div>
  )
}
