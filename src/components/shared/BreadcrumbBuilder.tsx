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
    <div className={`flex items-center gap-1 ${className}`}>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1

        return (
          <div key={index} className="flex items-center gap-1">
            <span
              className={`text-xs font-medium ${
                isLast ? 'max-w-[200px] truncate text-txt-black-900' : 'text-txt-black-500'
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
