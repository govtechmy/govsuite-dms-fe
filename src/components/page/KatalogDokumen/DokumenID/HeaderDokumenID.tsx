import { Button } from '@govtechmy/myds-react/button'
// import { DownloadIcon } from '@govtechmy/myds-react/icon'
import { DateCard } from '@/components/shared/DateCard'
import { renderStatusTag, renderSecretTag } from '@/utils/RenderTag'
import MaskHeader from '@/assets/bg-svg/MaskHeader'
import { BreadcrumbBuilder } from '@/components/shared/BreadcrumbBuilder'
import { useState } from 'react'
import ModalTakDiluluskan from './ModalTakDiluluskan'
import type { MetadataDocument } from '@/services/metadata.svc'
import DialogMetadataInfo from './DialogMetadataInfo'
import DialogKongsi from './DialogKongsi'
import { useAuthStore } from '@/store/AuthStore'
import { resolveUserRoles } from '@/models/userRoles'
import { HeartIcon } from '@govtechmy/myds-react/icon'

// rework metadata info once finalized
interface HeaderDokumenIDProps {
  type?: string
  id?: string
  recordId?: string
  folderId?: string
  fileName?: string
  status?: string
  accessLevel: string
  recordDate: string
  recordTitle: string
  unit: string
  path?: string
  documentProfile?: string
  documentProfileCode?: string
  metadataDocument?: MetadataDocument | null
  isFavorite?: boolean
  isFavoriteLoading?: boolean
  onApproveDokumen: () => void
  onNotApproveDokumen: (reason: string) => void
  onDownloadDokumen: (recordTitle: string) => void
  onShareDataRefresh?: () => Promise<void>
  onToggleFavorite?: () => void
}

export function HeaderDokumenID({
  recordTitle,
  path,
  recordDate,
  status,
  accessLevel,
  documentProfileCode,
  unit,
  metadataDocument,
  isFavorite = false,
  isFavoriteLoading = false,
  onApproveDokumen,
  onNotApproveDokumen,
  // onDownloadDokumen,
  onShareDataRefresh,
  onToggleFavorite,
}: HeaderDokumenIDProps) {
  const [isTakDiluluskanOpen, setIsTakDiluluskanOpen] = useState(false)

  const userRoles = useAuthStore((state) => state.user?.roles)
  const isPelulus = resolveUserRoles(userRoles).includes('PELULUS')

  const handleCloseTakDiluluskanModal = () => {
    setIsTakDiluluskanOpen(false)
  }

  const handleConfirmTakDiluluskan = (reason: string) => {
    setIsTakDiluluskanOpen(false)
    onNotApproveDokumen(reason)
  }

  return (
    <div className="relative flex w-full shrink-0 flex-col gap-4 overflow-hidden border-b border-otl-gray-200 bg-[radial-gradient(ellipse_2500px_1100px_at_top,theme(colors.bg-primary-200)_1%,theme(colors.bg-primary-50)_10%)] px-4 py-6 md:gap-6 md:p-8 md:py-12">
      <div className="pointer-events-none absolute inset-0">
        <MaskHeader className="h-full w-full" />
      </div>

      <div className="relative z-10 flex w-full max-w-[1000px] flex-col gap-4 md:gap-6">
        <div className="contents flex-wrap items-center justify-between gap-3 md:flex">
          <BreadcrumbBuilder path={path} />
          {isPelulus && status === 'DALAM_SEMAKAN' && (
            <div className="flex flex-wrap gap-1 max-md:gap-2 max-md:[&>button]:justify-center max-md:[&>button]:whitespace-nowrap max-md:[&>button]:flex-1">
              <Button variant="danger-fill" onClick={() => setIsTakDiluluskanOpen(true)}>
                Tidak Diluluskan
              </Button>
              <ModalTakDiluluskan
                isOpen={isTakDiluluskanOpen}
                onClose={handleCloseTakDiluluskanModal}
                onConfirm={handleConfirmTakDiluluskan}
              />
              <Button onClick={onApproveDokumen}>Diluluskan</Button>
            </div>
          )}
        </div>

        {/* Document Header */}
        <div className="flex w-full flex-wrap items-start gap-3 md:flex-nowrap md:items-end">
          {/* Date Card */}
          <DateCard date={recordDate} size="lg" className="shadow-sm border border-otl-gray-200" />

          {/* Content */}
          <div className="flex flex-1 flex-col gap-1.5 max-md:min-w-0">
            {/* Tags */}
            <div className="flex items-start gap-1 max-md:flex-wrap">
              {renderStatusTag(status || 'No Status')}
              {renderSecretTag(accessLevel)}
            </div>

            {/* Title */}
            <h1 className="line-clamp-2 text-base font-semibold text-txt-black-900 max-md:break-words">
              {recordTitle}
            </h1>

            {/* Metadata */}
            <div className="flex items-center gap-1.5 max-md:flex-wrap max-md:gap-y-0.5">
              <span className="text-sm font-medium text-txt-black-500">{documentProfileCode}</span>
              <div className="size-1 rounded-full bg-txt-black-500" />
              <span className="text-sm font-medium text-txt-black-500">{unit}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-1 max-md:w-full max-md:gap-2 max-md:[&>button:last-child]:flex-none max-md:[&>button]:flex-1 max-md:[&>button]:justify-center max-md:[&>button]:whitespace-nowrap">
            <DialogKongsi onShareDataRefresh={onShareDataRefresh} />
            {/* <Button
              variant="default-outline"
              size="small"
              className="gap-1.5"
              onClick={() => onDownloadDokumen(recordTitle)}
            >
              <DownloadIcon className="size-4" />
              Muat Turun
            </Button> */}
            <DialogMetadataInfo metadataDocument={metadataDocument} />
            <Button
              variant={'default-outline'}
              className={isFavorite ? 'px-2 text-txt-danger border-otl-danger-300' : 'px-2'}
              onClick={onToggleFavorite}
              disabled={isFavoriteLoading || !onToggleFavorite}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? 'Buang dari kegemaran' : 'Tambah ke kegemaran'}
            >
              <HeartIcon fill={isFavorite ? 'currentColor' : 'none'} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
