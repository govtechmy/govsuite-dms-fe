import type { KeyboardEvent } from 'react'

type CardVariant = 'primary' | 'warning' | 'danger' | 'default'

const cardVariantStyles: Record<CardVariant, { bgClass: string; borderClass: string }> = {
  primary: {
    bgClass: 'bg-bg-primary-50',
    borderClass: 'border-l-primary-200',
  },
  warning: {
    bgClass: 'bg-bg-warning-50',
    borderClass: 'border-l-bg-warning-200',
  },
  danger: {
    bgClass: 'bg-bg-danger-50',
    borderClass: 'border-l-bg-danger-200',
  },
  default: {
    bgClass: 'bg-bg-washed',
    borderClass: 'border-l-gray-600/20',
  },
}

type RingkasanEksekutifCardProps = {
  label: string | null | undefined
  value: number | string | null | undefined
  variant: CardVariant | null | undefined
  onClick?: () => void
}

export function RingkasanEksekutifCard({
  label,
  value,
  variant,
  onClick,
}: RingkasanEksekutifCardProps) {
  const safeVariant = variant ?? 'primary'
  const variantStyle = cardVariantStyles[safeVariant]
  const bgClass = variantStyle?.bgClass ?? 'bg-bg-primary-50'
  const borderClass = variantStyle?.borderClass ?? 'border-l-primary-200'
  const displayValue = value ?? 0
  const displayLabel = label ?? '—'

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <div
      className={`relative overflow-hidden border-l-[10px] rounded-lg h-[108px] w-full flex flex-col justify-center items-center gap-3 ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${bgClass} ${borderClass}`}
      onClick={onClick}
      role="button"
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
    >
      <div className="text-5xl font-semibold text-txt-black-900">{displayValue}</div>
      <div className="text-body-m font-medium text-txt-black-700">{displayLabel}</div>
    </div>
  )
}
