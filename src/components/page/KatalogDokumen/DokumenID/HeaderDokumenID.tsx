import { Button } from '@govtechmy/myds-react/button'
import {
  DownloadIcon,
  DocumentFilledIcon,
  ShareIcon,
  EmailIcon,
  TrashIcon,
} from '@govtechmy/myds-react/icon'
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
import { Input, InputIcon } from '@govtechmy/myds-react/input'
import { Checkbox } from '@govtechmy/myds-react/checkbox'
import getUserInitials from '@/utils/getUserInitials'
import ProgressResultChecker, { type ProgressState } from '@/components/shared/ProgressResult'

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
}: HeaderDokumenIDProps) {
  const [isTakDiluluskanOpen, setIsTakDiluluskanOpen] = useState(false)
  const [shareSearchValue, setShareSearchValue] = useState('')
  const [selectedShareUsers, setSelectedShareUsers] = useState<string[]>([])
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [shareProgress, setShareProgress] = useState<ProgressState>(null)
  const [shareErrorMessage, setShareErrorMessage] = useState<string | null>(null)

  const handleCloseTakDiluluskanModal = () => {
    setIsTakDiluluskanOpen(false)
  }

  const handleConfirmTakDiluluskan = (reason: string) => {
    setIsTakDiluluskanOpen(false)
    onNotApproveDokumen(reason)
  }

  const user = [
    { username: 'Azrul Hisham Bin Kamarul Zaman1', email: 'azrulhisham1@digital.gov.my' },
    { username: 'Azrul Hisham Bin Kamarul Zaman2', email: 'azrulhisham2@digital.gov.my' },
    { username: 'Azrul Hisham Bin Kamarul Zaman3', email: 'azrulhisham3@digital.gov.my' },
    { username: 'Azrul Hisham Bin Kamarul Zaman4', email: 'azrulhisham4@digital.gov.my' },
    { username: 'Azrul Hisham Bin Kamarul Zaman5', email: 'azrulhisham5@digital.gov.my' },
    { username: 'Azrul Hisham Bin Kamarul Zaman6', email: 'azrulhisham6@digital.gov.my' },
    { username: 'Azrul Hisham Bin Kamarul Zaman7', email: 'azrulhisham7@digital.gov.my' },
    { username: 'Azrul Hisham Bin Kamarul Zaman8', email: 'azrulhisham8@digital.gov.my' },
    { username: 'Azrul Hisham Bin Kamarul Zaman9', email: 'azrulhisham1@digital.gov.my' },
    { username: 'Azrul Hisham Bin Kamarul Zaman10', email: 'azrulhisham2@digital.gov.my' },
    { username: 'Azrul Hisham Bin Kamarul Zaman11', email: 'azrulhisham3@digital.gov.my' },
    { username: 'Azrul Hisham Bin Kamarul Zaman12', email: 'azrulhisham4@digital.gov.my' },
    { username: 'Azrul Hisham Bin Kamarul Zaman13', email: 'azrulhisham5@digital.gov.my' },
    { username: 'Azrul Hisham Bin Kamarul Zaman14', email: 'azrulhisham6@digital.gov.my' },
    { username: 'Azrul Hisham Bin Kamarul Zaman15', email: 'azrulhisham7@digital.gov.my' },
    { username: 'Azrul Hisham Bin Kamarul Zaman16', email: 'azrulhisham8@digital.gov.my' },
  ]

  const normalizedShareInput = shareSearchValue.trim()
  const normalizedSelectedRecipients = selectedShareUsers.join(', ').trim()
  const isShowingSelectedRecipients =
    normalizedShareInput !== '' && normalizedShareInput === normalizedSelectedRecipients
  const isTypingNewRecipient = normalizedShareInput === '' || /,\s*$/.test(shareSearchValue)
  const searchKeyword =
    isTypingNewRecipient || isShowingSelectedRecipients
      ? ''
      : (shareSearchValue.split(',').pop()?.trim().toLowerCase() ?? '')

  const filteredUsers = user.filter(({ username, email }) => {
    if (!searchKeyword) {
      return true
    }

    return (
      username.toLowerCase().includes(searchKeyword) || email.toLowerCase().includes(searchKeyword)
    )
  })

  const handleFinalizeShareSelection = () => {
    setIsShareDropdownOpen(false)
    setShareSearchValue(selectedShareUsers.length > 0 ? selectedShareUsers.join(', ') : '')
  }

  const toggleSelectedShareUser = (email: string) => {
    const nextSelectedUsers = selectedShareUsers.includes(email)
      ? selectedShareUsers.filter((selectedEmail) => selectedEmail !== email)
      : [...selectedShareUsers, email]

    setSelectedShareUsers(nextSelectedUsers)
    setShareSearchValue(nextSelectedUsers.length > 0 ? `${nextSelectedUsers.join(', ')}, ` : '')
  }

  const resetShareState = () => {
    setShareProgress(null)
    setShareErrorMessage(null)
    setIsShareDropdownOpen(false)
  }

  const handleShareDialogOpenChange = (open: boolean) => {
    setIsShareDialogOpen(open)

    if (!open) {
      resetShareState()
    }
  }

  const handleCloseShareProgress = () => {
    setIsShareDialogOpen(false)
    resetShareState()
  }

  const handleRetryShare = () => {
    setShareProgress(null)
    setShareErrorMessage(null)
  }

  const mockSharePostRequest = async (recipients: string[]) => {
    await new Promise((resolve) => {
      setTimeout(resolve, 1200)
    })

    if (recipients.length === 0) {
      throw new Error('Sila pilih sekurang-kurangnya seorang pengguna.')
    }
  }

  const handleShareDokumen = async () => {
    setShareProgress('loading')
    setShareErrorMessage(null)
    setIsShareDropdownOpen(false)

    try {
      await mockSharePostRequest(selectedShareUsers)
      setShareProgress('success')
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Kongsi dokumen gagal. Sila cuba lagi atau hubungi pentadbir.'

      setShareErrorMessage(errorMessage)
      setShareProgress('error')
    }
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
            <Dialog open={isShareDialogOpen} onOpenChange={handleShareDialogOpenChange}>
              <DialogTrigger>
                <Button variant="default-outline" size="small" className="gap-1.5">
                  <ShareIcon className="size-4" />
                  Kongsi
                </Button>
              </DialogTrigger>
              <DialogBody className="w-full max-w-[calc(100dvw-36px)] sm:max-w-2xl lg:max-w-4xl [&>button]:p-2 [&>button_svg]:size-4">
                <DialogHeader className="pb-4.5">
                  <DialogTitle>Kongsi Dokumen Ini</DialogTitle>
                </DialogHeader>
                <DialogContent className="border-t border-otl-gray-200 p-6 max-h-[600px] min-h-[500px] overflow-y-auto">
                  <DialogDescription className="hidden">
                    Dialog content goes here.
                  </DialogDescription>
                  {shareProgress ? (
                    <div className="flex min-h-[500px] w-full items-center justify-center">
                      <ProgressResultChecker
                        progress={shareProgress}
                        loadingDescription="Dokumen sedang dikongsi. Sila tunggu sebentar."
                        successTitle="Dokumen Berjaya Dikongsi"
                        successDescription="Dokumen telah berjaya dikongsi kepada pengguna yang dipilih."
                        successButtonText="Tutup"
                        errorTitle="Dokumen Gagal Dikongsi"
                        errorDescription={
                          <div className="flex flex-col items-center justify-center gap-2 text-center">
                            <div>Kongsi dokumen tidak berjaya. Sila cuba lagi.</div>
                            <div>
                              {shareErrorMessage ?? 'Permintaan kongsi dokumen gagal diproses.'}
                            </div>
                          </div>
                        }
                        errorButtonText="Cuba Lagi"
                        onSuccessClick={handleCloseShareProgress}
                        onErrorClick={handleRetryShare}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="text-body-md font-medium">Masukkan ID Pengguna</div>
                        <div className="relative w-full">
                          <div className="flex flex-row gap-1">
                            <Input
                              className="w-full"
                              placeholder="pengguna@digital.gov.my"
                              onChange={(e) => {
                                setShareSearchValue(e.target.value)
                                setIsShareDropdownOpen(true)
                              }}
                              onFocus={() => setIsShareDropdownOpen(true)}
                              onClick={() => setIsShareDropdownOpen(true)}
                              value={shareSearchValue}
                            >
                              <InputIcon position="left">
                                <EmailIcon className="size-4 text-txt-black-500" />
                              </InputIcon>
                            </Input>
                            <Button type="button" onClick={handleShareDokumen}>
                              Kongsi
                            </Button>
                          </div>

                          {isShareDropdownOpen && filteredUsers.length > 0 && (
                            <div className="absolute z-20 mt-1.5 flex max-h-[400px] w-full flex-col overflow-hidden rounded-md border border-otl-gray-200 bg-bg-white p-1 shadow-sm">
                              <div className="min-h-0 flex-1 overflow-y-auto">
                                {filteredUsers.map((foundUser) => {
                                  const isChecked = selectedShareUsers.includes(foundUser.email)

                                  return (
                                    <button
                                      key={foundUser.email}
                                      type="button"
                                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left hover:bg-bg-primary-100"
                                      onClick={() => toggleSelectedShareUser(foundUser.email)}
                                    >
                                      <div className="flex flex-1 flex-col">
                                        <div className="text-body-sm font-medium text-txt-black-700">
                                          {foundUser.username}
                                        </div>
                                        <div className="text-body-xs font-normal text-txt-black-500">
                                          {foundUser.email}
                                        </div>
                                      </div>
                                      <Checkbox
                                        checked={isChecked}
                                        aria-label={`Pilih pengguna ${foundUser.username}`}
                                      />
                                    </button>
                                  )
                                })}
                              </div>
                              <div className="flex justify-end border-t border-otl-gray-200 pt-1">
                                <Button
                                  type="button"
                                  variant="primary-fill"
                                  size="small"
                                  onClick={handleFinalizeShareSelection}
                                >
                                  Selesai Pilih
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        {selectedShareUsers.length > 0 && (
                          <div className="text-body-xs font-normal text-txt-black-500">
                            {selectedShareUsers.length} pengguna dipilih
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="text-body-sm font-normal text-txt-black-500">
                          Dokumen ini boleh diakses oleh:
                        </div>

                        {user.map((selectedUser) => (
                          <div
                            key={selectedUser.email}
                            className="flex items-center gap-1.5 px-1 py-1 border-b"
                          >
                            <div className="size-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                              <div className="text-txt-primary font-body text-body-sm">
                                {getUserInitials(selectedUser.username)}
                              </div>
                            </div>
                            <div className="flex flex-col flex-1 min-w-0 pl-2">
                              <div className="text-body-sm font-medium text-txt-black-700">
                                {selectedUser.username}
                              </div>
                              <div className="text-body-xs font-normal text-txt-black-500">
                                {selectedUser.email}
                              </div>
                            </div>
                            <Button
                              aria-label={`Padam pengguna ${selectedUser.username}`}
                              variant="danger-outline"
                              className="p-2 shrink-0 border-0"
                              style={{ boxShadow: 'none' }}
                            >
                              <TrashIcon className="size-6 shrink-0" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </DialogContent>
              </DialogBody>
            </Dialog>
            <Button
              variant="default-outline"
              size="small"
              className="gap-1.5"
              onClick={() => onDownloadDokumen(recordTitle)}
            >
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
