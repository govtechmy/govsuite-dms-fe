import { Button } from '@govtechmy/myds-react/button'
import { DownloadIcon, DocumentFilledIcon } from '@govtechmy/myds-react/icon'
import { DateCard } from '@/components/shared/DateCard'
import { renderStatusTag, renderSecretTag } from '@/utils/RenderTag'
import MaskHeader from '@/assets/bg-svg/MaskHeader'
import { BreadcrumbBuilder } from '@/components/shared/BreadcrumbBuilder'
import {
  Dialog,
  DialogTrigger,
  DialogBody,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@govtechmy/myds-react/dialog'
import MetadataSummary from '@/components/shared/MetadataSummary'
import { useState } from 'react'
import ModalTakDiluluskan from './ModalTakDiluluskan'
import type { MetadataDocument } from '@/services/metadata.svc'

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
  onNotApproveDokumen: () => void
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
}: HeaderDokumenIDProps) {
  const [isTakDiluluskanOpen, setIsTakDiluluskanOpen] = useState(false)

  const handleCloseTakDiluluskanModal = () => {
    setIsTakDiluluskanOpen(false)
  }

  const handleConfirmTakDiluluskan = () => {
    setIsTakDiluluskanOpen(false)
    onNotApproveDokumen()
  }

  return (
    <div className="relative flex w-full flex-col gap-6 overflow-hidden border-b border-otl-gray-200 bg-[radial-gradient(ellipse_2500px_1100px_at_top,theme(colors.bg-primary-200)_1%,theme(colors.bg-primary-50)_10%)] p-8 py-12">
      <div className="pointer-events-none absolute inset-0">
        <MaskHeader className="h-full w-full" />
      </div>

      <div className="relative z-10 flex w-full max-w-[1000px] flex-col gap-6">
        <div className="flex justify-between">
          <BreadcrumbBuilder path={path} />
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
            <Button variant="default-outline" size="small" className="gap-1.5">
              <DownloadIcon className="size-4" />
              Muat Turun
            </Button>

            <Dialog>
              <DialogTrigger>
                <Button variant="default-outline" size="small" className="gap-1.5">
                  <DocumentFilledIcon className="size-4" />
                  Lihat Metadata
                </Button>
              </DialogTrigger>
              <DialogBody className="w-full max-w-[calc(100dvw-36px)] sm:max-w-2xl lg:max-w-4xl [&>button]:p-2 [&>button_svg]:size-4">
                <DialogHeader className="pb-4.5">
                  <DialogTitle>Lihat Metadata</DialogTitle>
                </DialogHeader>
                <DialogContent className="border-y border-otl-gray-200 p-6 max-h-[600px] overflow-y-auto">
                  <DialogDescription className="hidden">
                    Dialog content goes here.
                  </DialogDescription>
                  <div className="flex flex-col gap-6">
                    <MetadataSummary metadata={metadataDocument} />
                  </div>
                </DialogContent>
                <DialogFooter>
                  <DialogClose>
                    <Button variant="primary-fill">Salin Rujukan</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogBody>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}
