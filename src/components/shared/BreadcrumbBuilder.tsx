import { ChevronRightIcon } from '@govtechmy/myds-react/icon'

interface BreadcrumbBuilderProps {
  path: string | null | undefined
  className?: string
}

export function BreadcrumbBuilder({ path, className = '' }: BreadcrumbBuilderProps) {
  if (!path) return null

  const segments = path.split('/').filter(Boolean)

  if (segments.length === 0) return null

  return (
    <div className={`flex min-w-0 flex-wrap items-center gap-1 ${className}`}>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1

        return (
          <div key={index} className="flex min-w-0 items-center gap-1">
            <span
              className={`max-w-[200px] truncate text-xs font-medium ${
                isLast ? 'text-txt-black-900' : 'text-txt-black-500'
              }`}
            >
              {segment}
            </span>
            {!isLast && <ChevronRightIcon className="size-4 text-txt-black-500" />}
          </div>
        )
      })}
    </div>
  )
}
