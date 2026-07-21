import { Button } from '@govtechmy/myds-react/button'
import { DownloadIcon } from '@govtechmy/myds-react/icon'
import { DateCard } from '@/components/shared/DateCard'
import { renderStatusTag, renderSecretTag } from '@/utils/RenderTag'
import MaskHeader from '@/assets/bg-svg/MaskHeader'
import { BreadcrumbBuilder } from '@/components/shared/BreadcrumbBuilder'
import { useState } from 'react'
import ModalTakDiluluskan from './ModalTakDiluluskan'
import type { MetadataDocument } from '@/services/metadata.svc'
import DialogMetadataInfo from './DialogMetadataInfo'
import DialogKongsi from './DialogKongsi'

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
  onApproveDokumen: () => void
  onNotApproveDokumen: (reason: string) => void
  onDownloadDokumen: (recordTitle: string) => void
  onShareDataRefresh?: () => Promise<void>
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
  onApproveDokumen,
  onNotApproveDokumen,
  onDownloadDokumen,
  onShareDataRefresh,
}: HeaderDokumenIDProps) {
  const [isTakDiluluskanOpen, setIsTakDiluluskanOpen] = useState(false)

  const handleCloseTakDiluluskanModal = () => {
    setIsTakDiluluskanOpen(false)
  }

  const handleConfirmTakDiluluskan = (reason: string) => {
    setIsTakDiluluskanOpen(false)
    onNotApproveDokumen(reason)
  }

  return (
    <div className="relative flex w-full flex-col gap-6 overflow-hidden border-b border-otl-gray-200 bg-[radial-gradient(ellipse_2500px_1100px_at_top,theme(colors.bg-primary-200)_1%,theme(colors.bg-primary-50)_10%)] p-8 py-12">
      <div className="pointer-events-none absolute inset-0">
        <MaskHeader className="h-full w-full" />
      </div>

      <div className="relative z-10 flex w-full max-w-[1000px] flex-col gap-6">
        <div className="flex justify-between">
          <BreadcrumbBuilder path={path} />
          {status === 'DALAM_SEMAKAN' && (
            <div className="flex gap-1">
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
        <div className="flex w-full items-end gap-3">
          {/* Date Card */}
          <DateCard date={recordDate} size="lg" className="shadow-sm border border-otl-gray-200" />

          {/* Content */}
          <div className="flex flex-1 flex-col gap-1.5">
            {/* Tags */}
            <div className="flex items-start gap-1">
              {renderStatusTag(status || 'No Status')}
              {renderSecretTag(accessLevel)}
            </div>

            {/* Title */}
            <h1 className="line-clamp-2 text-base font-semibold text-txt-black-900">
              {recordTitle}
            </h1>

            {/* Metadata */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-txt-black-500">{documentProfileCode}</span>
              <div className="size-1 rounded-full bg-txt-black-500" />
              <span className="text-sm font-medium text-txt-black-500">{unit}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <DialogKongsi onShareDataRefresh={onShareDataRefresh} />
            <Button
              variant="default-outline"
              size="small"
              className="gap-1.5"
              onClick={() => onDownloadDokumen(recordTitle)}
            >
              <DownloadIcon className="size-4" />
              Muat Turun
            </Button>
            <DialogMetadataInfo metadataDocument={metadataDocument} />
          </div>
        </div>
      </div>
    </div>
  )
}
