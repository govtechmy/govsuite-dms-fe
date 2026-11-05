import { clx } from '@govtechmy/myds-react/utils'
import DocumentMetaTag from './DocumentMetaTag'
import getRelevanceDotClass from '@/utils/getRelevanceDotClass'
import dataSampleHibrid from './hibridHtmlSample'

export default function HybridRecordResultSearch() {
  return (
    <section className="flex h-[560px] w-full flex-col gap-3 lg:h-full lg:min-h-0">
      <h2 className="text-body-md font-semibold text-txt-black-900">
        {/* Placeholder */}
        Hasil Carian 10 rekod
      </h2>

      <ul
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1"
        aria-label="Senarai hasil carian"
      >
        {dataSampleHibrid.data.items.map((record) => {
          return (
            <li key={`${record.record_id}-${record.page_number}`}>
              <button
                type="button"
                // className={clx(
                //   'relative flex w-full cursor-pointer flex-col gap-2 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fr-primary',
                //   isSelected
                //     ? 'border-otl-primary-300 bg-bg-primary-50'
                //     : 'border-otl-gray-200 bg-bg-white hover:bg-bg-washed'
                // )}
                className="relative flex w-full cursor-pointer flex-col gap-2 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fr-primary border-otl-gray-200 bg-bg-white hover:bg-bg-washed"
              >
                <span className="flex items-center gap-1.5 self-end text-body-xs font-semibold text-txt-black-900">
                  <span
                    className={clx(
                      'size-2 rounded-full',
                      getRelevanceDotClass(70) //Temporary placeholder
                    )}
                    aria-hidden="true"
                  />
                  {/* Temporary placeholder */}
                  <span className="sr-only">Skor relevan</span>
                  70%
                </span>
                {/* Temporary placeholder */}
                <p className="line-clamp-3 text-body-xs text-txt-black-700">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero quis expedita animi
                  deleniti? Delectus voluptas magnam ullam provident sed rem in iure quisquam non
                  quaerat! Fuga nam assumenda cum aspernatur?
                </p>
                <p className="line-clamp-2 text-body-sm font-semibold text-txt-primary underline underline-offset-2">
                  {/* Temporary placeholder */}
                  Title
                </p>
                <DocumentMetaTag
                  jenisDokumen={'Dokumen'} //Temporary placeholder
                  tarikh={'11/22/2000'} //Temporary placeholder
                />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
