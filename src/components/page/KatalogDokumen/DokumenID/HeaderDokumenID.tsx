import { Button } from '@govtechmy/myds-react/button'
import { DownloadIcon, DocumentFilledIcon } from '@govtechmy/myds-react/icon'
import { DateCard } from '@/components/shared/DateCard'
import { renderStatusTag, renderSecretTag } from '@/utils/RenderTag'
import MaskHeader from '@/assets/bg-svg/MaskHeader'
import { BreadcrumbBuilder } from '@/components/shared/BreadcrumbBuilder'

interface HeaderDokumenIDProps {
  title: string
  path: string
  date: string
  status: string
  classification: string
  category: string
  unit: string
}

export function HeaderDokumenID({
  title,
  path,
  date,
  status,
  classification,
  category,
  unit,
}: HeaderDokumenIDProps) {
  return (
    <div className="relative flex w-full flex-col gap-6 overflow-hidden border-b border-otl-gray-200 bg-[radial-gradient(ellipse_2500px_1100px_at_top,theme(colors.bg-primary-200)_1%,theme(colors.bg-primary-50)_10%)] p-8 py-12">
      <div className="pointer-events-none absolute inset-0">
        <MaskHeader className="h-full w-full" />
      </div>

      <div className="relative z-10 flex w-full max-w-[1000px] flex-col gap-6">
        <BreadcrumbBuilder path={path} />
        {/* Document Header */}
        <div className="flex w-full items-end gap-3">
          {/* Date Card */}
          <DateCard date={date} size="lg" className="shadow-sm border border-otl-gray-200" />

          {/* Content */}
          <div className="flex flex-1 flex-col gap-1.5">
            {/* Tags */}
            <div className="flex items-start gap-1">
              {renderStatusTag(status)}
              {renderSecretTag(classification)}
            </div>

            {/* Title */}
            <h1 className="line-clamp-2 text-base font-semibold text-txt-black-900">{title}</h1>

            {/* Metadata */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-txt-black-500">{category}</span>
              <div className="size-1 rounded-full bg-txt-black-500" />
              <span className="text-sm font-medium text-txt-black-500">{unit}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button variant="default-outline" size="small" className="gap-1.5">
              <DownloadIcon className="size-4" />
              Muat Turun
            </Button>
            <Button variant="default-outline" size="small" className="gap-1.5">
              <DocumentFilledIcon className="size-4" />
              Lihat Metadata
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
