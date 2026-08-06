import { Button } from '@govtechmy/myds-react/button'
import {
  Dialog,
  DialogBody,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from '@govtechmy/myds-react/dialog'
import { TrashIcon } from '@govtechmy/myds-react/icon'
import {
  SummaryList,
  SummaryListBody,
  SummaryListRow,
  SummaryListTerm,
  SummaryListDetail,
  SummaryListAction,
} from '@govtechmy/myds-react/summary-list'
import ProgressResultChecker from '@/components/shared/ProgressResult'
import { useResubmitDokumen } from '@/hooks/useResubmitDokumen'
import type { CatalogDocumentItem } from '@/services/catalog.svc'
import normalizeWord from '@/utils/NormalizeWord'
import { formatISODateString } from '@/utils/formatDate'
import formatRejectReason from '@/utils/formatRejectReason'
import removeLainLain from '@/utils/removeLainLain'
import { useNavigate, useParams } from 'react-router-dom'

type MetadataModalTidakLulusProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDocument: CatalogDocumentItem | null
}

export default function MetadataModalTidakLulus({
  open,
  onOpenChange,
  selectedDocument,
}: MetadataModalTidakLulusProps) {
  const navigate = useNavigate()
  const { lang } = useParams()
  const activeLang = lang ?? localStorage.getItem('lang') ?? 'ms'
  const recordId = selectedDocument?.recordId
  const {
    progressResubmit,
    resubmitError,
    progressDelete,
    deleteError,
    handleResubmitClick,
    handleDeleteClick,
    resetResubmitState,
  } = useResubmitDokumen(recordId)
  const isResubmitInProgress = progressResubmit !== null
  const isDeleteInProgress = progressDelete !== null
  const isActionInProgress = isResubmitInProgress || isDeleteInProgress

  // reset after close technique to remove flashes
  const closeThenResetState = (onAfterClose?: () => void) => {
    onOpenChange(false)
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        resetResubmitState()
        onAfterClose?.()
      })
    })
  }

  const reloadIfActionSucceeded = () => {
    if (progressDelete === 'success' || progressResubmit === 'success') {
      window.location.reload()
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      closeThenResetState(reloadIfActionSucceeded)
      return
    }

    onOpenChange(nextOpen)
  }

  const handleCloseProgress = () => {
    closeThenResetState(reloadIfActionSucceeded)
  }

  const handleEditDokumenClick = () => {
    if (!recordId) return
    navigate(`/${activeLang}/muatnaik-dokumen/${recordId}`)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogBody className="flex w-full max-w-[calc(100dvw-36px)] flex-col sm:max-w-2xl lg:min-w-[750px] lg:min-h-[400px]">
        {!isActionInProgress && (
          <>
            <DialogHeader className="pb-4.5">
              <DialogTitle>Metadata</DialogTitle>
            </DialogHeader>
            <DialogContent className=" border-y border-otl-gray-200 p-6 [&>button]:p-1 [&>button_svg]:size-3.5">
              <DialogDescription className="hidden">Dialog content goes here.</DialogDescription>
              <SummaryList>
                <SummaryListBody>
                  <SummaryListRow>
                    <SummaryListTerm className="font-medium">Lokasi Folder</SummaryListTerm>
                    <SummaryListDetail className="break-words">
                      {selectedDocument?.path || 'Tiada Info'}
                    </SummaryListDetail>
                    <SummaryListAction></SummaryListAction>
                  </SummaryListRow>

                  <SummaryListRow>
                    <SummaryListTerm className="font-medium">Jenis</SummaryListTerm>
                    <SummaryListDetail>
                      {selectedDocument?.documentProfile || 'Tiada Info'}
                    </SummaryListDetail>
                    <SummaryListAction></SummaryListAction>
                  </SummaryListRow>

                  <SummaryListRow>
                    <SummaryListTerm className="font-medium">Unit</SummaryListTerm>
                    <SummaryListDetail>
                      {normalizeWord(selectedDocument?.unit) || 'Tiada Info'}
                    </SummaryListDetail>
                    <SummaryListAction></SummaryListAction>
                  </SummaryListRow>

                  <SummaryListRow>
                    <SummaryListTerm className="font-medium">Tarikh Muat Naik</SummaryListTerm>
                    <SummaryListDetail>
                      {selectedDocument?.recordDate
                        ? formatISODateString(selectedDocument.recordDate)
                        : 'Tiada Info'}
                    </SummaryListDetail>
                    <SummaryListAction></SummaryListAction>
                  </SummaryListRow>

                  <SummaryListRow>
                    <SummaryListTerm className="font-medium">Tajuk</SummaryListTerm>
                    <SummaryListDetail>
                      {selectedDocument?.recordTitle || 'Tiada Info'}
                    </SummaryListDetail>
                    <SummaryListAction></SummaryListAction>
                  </SummaryListRow>

                  <SummaryListRow>
                    <SummaryListTerm className="font-medium">Nama Pemuat Naik</SummaryListTerm>
                    <SummaryListDetail>
                      {selectedDocument?.createdBy || 'Tiada Info'}
                    </SummaryListDetail>
                    <SummaryListAction></SummaryListAction>
                  </SummaryListRow>

                  <SummaryListRow>
                    <SummaryListTerm className="font-medium">
                      Sebab Tidak Diluluskan
                    </SummaryListTerm>
                    <SummaryListDetail className="text-txt-danger">
                      {selectedDocument?.reason
                        ? removeLainLain(formatRejectReason(selectedDocument.reason))
                        : 'Tiada Info'}
                    </SummaryListDetail>
                    <SummaryListAction></SummaryListAction>
                  </SummaryListRow>
                </SummaryListBody>
              </SummaryList>
            </DialogContent>
            <DialogFooter className="flex flex-wrap justify-between gap-2">
              <Button variant="danger-outline" onClick={handleDeleteClick}>
                <TrashIcon />
                Hapus Dokumen
              </Button>
              <Button variant="primary-fill" onClick={handleResubmitClick}>
                Kemaskini Dokumen
              </Button>
            </DialogFooter>
          </>
        )}

        {isResubmitInProgress && (
          <>
            <div className="flex flex-col w-full flex-1 items-center justify-center">
              <ProgressResultChecker
                progress={progressResubmit}
                loadingDescription="Dokumen sedang dihantar semula. Sila tunggu sebentar."
                successTitle="Dokumen Berjaya Dihantar Semula"
                successDescription="Dokumen telah dihantar semula untuk semakan seterusnya."
                successButtonText="Tutup"
                successButtonText2="Edit Dokumen Anda!"
                successButtonClassName2="bg-bg-white border border-success-700/20 hover:border-success-700/10 text-txt-success shadow-button hover:text-txt-success hover:bg-bg-success-50 disabled:bg-bg-white-disabled disabled:text-txt-success-disabled disabled:border-transparent"
                errorTitle="Dokumen Gagal Dihantar Semula"
                errorDescription={
                  <div className="flex flex-col gap-2 items-center justify-center">
                    <div>Dokumen gagal dihantar semula, sila cuba lagi atau hubungi pentadbir.</div>
                    <div>
                      {resubmitError?.code ?? 'REQUEST_FAILED'} :{' '}
                      {resubmitError?.message ?? 'Permintaan hantar semula gagal diproses.'}
                    </div>
                  </div>
                }
                errorButtonText="Tutup"
                onSuccessClick={handleCloseProgress}
                onSuccessClick2={handleEditDokumenClick}
                onErrorClick={handleCloseProgress}
              />
            </div>
          </>
        )}

        {isDeleteInProgress && (
          <>
            <div className="flex flex-col w-full flex-1 items-center justify-center">
              <ProgressResultChecker
                progress={progressDelete}
                loadingDescription="Dokumen sedang dihapuskan. Sila tunggu sebentar."
                successTitle="Dokumen Berjaya Dihapuskan"
                successDescription="Dokumen telah berjaya dihapuskan daripada rekod semasa."
                successButtonText="Tutup"
                errorTitle="Dokumen Gagal Dihapuskan"
                errorDescription={
                  <div className="flex flex-col gap-2 items-center justify-center">
                    <div>Dokumen gagal dihapuskan, sila cuba lagi atau hubungi pentadbir.</div>
                    <div>
                      {deleteError?.code ?? 'REQUEST_FAILED'} :{' '}
                      {deleteError?.message ?? 'Permintaan hapus dokumen gagal diproses.'}
                    </div>
                  </div>
                }
                errorButtonText="Tutup"
                onSuccessClick={handleCloseProgress}
                onErrorClick={handleCloseProgress}
              />
            </div>
          </>
        )}
      </DialogBody>
    </Dialog>
  )
}
