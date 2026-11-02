import { useState } from 'react'
import HybridPratontonSearchResult from './HybridPratontonSearchResult'
import HybridRecordResultSearch from './HybridRecordResultSearch'
import { SAMPLE_HYBRID_RECORDS } from './sampleHybridRecords'

export default function HybridSearchResults() {
  const [selectedIndex, setSelectedIndex] = useState(0)

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col items-stretch md:flex-row">
        <HybridPratontonSearchResult
          record={SAMPLE_HYBRID_RECORDS[selectedIndex]}
          recordPosition={selectedIndex + 1}
          totalItems={SAMPLE_HYBRID_RECORDS.length}
          onPreviousRecord={() => setSelectedIndex((index) => index - 1)}
          onNextRecord={() => setSelectedIndex((index) => index + 1)}
        />
        <div className="order-first flex min-h-0 w-full shrink-0 flex-col border-t px-4 pt-4 sm:px-6 sm:pt-6 md:order-none md:h-full md:w-[320px] md:border-y md:py-3 md:pl-0 lg:w-[360px]">
          <HybridRecordResultSearch
            records={SAMPLE_HYBRID_RECORDS}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
          />
        </div>
      </div>
    </div>
  )
}
