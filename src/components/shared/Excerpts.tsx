import DotIcon from '@/assets/Icons/Dot'
import { renderStatusTag, renderSecretTag } from '@/utils/RenderTag'
import { clx } from '@govtechmy/myds-react/utils'
import { DateCard } from './DateCard'

export interface ExcerptsProps {
  date: string
  secretTag: string
  statusTag: string
  title?: string
  type: string
  unit: string
}

export default function Excerpts({ date, secretTag, statusTag, title, type, unit }: ExcerptsProps) {
  return (
    <div className="flex flex-row shadow-button rounded-lg">
      <div
        className={clx(
          'border border-otl-gray-200 rounded-lg p-1.5 px-0 gap-3 rounded-r-none border-r-0 flex items-center shrink-0 justify-center'
        )}
      >
        <DateCard date={date} size={'sm'} className="flex-shrink-0" />
      </div>
      <div className="border-r border-otl-divider"></div>
      <div
        className={clx(
          'border border-otl-gray-200 rounded-lg p-3 gap-3  rounded-l-none flex-1 border-l-0'
        )}
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1">
            {renderStatusTag(statusTag)}
            {renderSecretTag(secretTag)}
          </div>
          <div className="text-body-md font-semibold">{title}</div>
          <div className="flex items-center gap-1.5 text-txt-black-500 text-body-sm font-normal ">
            <div>{type}</div>
            <div className="flex items-center justify-center">
              <DotIcon className="size-1.5" />
            </div>
            <div>{unit}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
