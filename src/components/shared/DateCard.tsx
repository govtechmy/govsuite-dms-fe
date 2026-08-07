import { clx } from '@govtechmy/myds-react/utils'
import { formatISODate } from '@/utils/formatDate'

export interface DateCardProps {
  className?: string
  date: string
  size: 'sm' | 'lg'
}

export const DateCard: React.FC<DateCardProps> = ({ className, date, size }) => {
  const _date = formatISODate(date, 'ms')

  return (
    <div
      className={clx(
        'flex h-fit select-none flex-col justify-center rounded-md bg-bg-white p-1.5 text-center',
        size === 'sm' ? 'w-[50px] lg:w-[60px]' : '',
        size === 'lg' ? 'w-[60px] lg:w-[80px]' : '',
        className
      )}
    >
      <span
        className={clx(
          'uppercase text-txt-danger',
          size === 'sm' ? 'text-[10px] leading-[14px] lg:text-xs' : '',
          size === 'lg' ? 'text-xs lg:text-sm lg:font-medium' : ''
        )}
      >
        {_date.month}
      </span>
      <span
        className={clx(
          'text-txt-black-900',
          size === 'sm' ? 'text-[16px] font-medium leading-5 lg:text-xl lg:font-semibold' : '',
          size === 'lg' ? 'text-xl font-semibold lg:text-[32px] lg:leading-tight' : ''
        )}
      >
        {_date.day}
      </span>
      <span
        className={clx(
          'text-txt-black-500',
          size === 'sm' ? 'text-[10px] leading-[14px] lg:text-xs' : '',
          size === 'lg' ? 'text-xs lg:text-sm lg:font-medium' : ''
        )}
      >
        {_date.year}
      </span>
    </div>
  )
}
