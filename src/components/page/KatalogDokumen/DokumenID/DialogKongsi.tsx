import { useEffect, useRef, useState } from 'react'
import { Button } from '@govtechmy/myds-react/button'
import { ShareIcon } from '@govtechmy/myds-react/icon'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@govtechmy/myds-react/dialog'
import { useParams } from 'react-router-dom'
import ProgressResultChecker, { type ProgressState } from '@/components/shared/ProgressResult'
import extractBackendError from '@/utils/extractBackendError'
import {
  removeRecordSharing,
  shareSpecificRecord,
  type ShareUser,
} from '@/services/shareDocument.svc'
import { useShareDocumentStore } from '@/store/ShareDocumentStore'
import DialogUserDeletion from './DialogUserDeletion'
import AccessibleDocumentInfo from './AccessibleDocumentInfo'
import SelectionOfUser from './SelectionOfUser'

interface DialogKongsiProps {
  onShareDataRefresh?: () => Promise<void>
}

export default function DialogKongsi({ onShareDataRefresh }: DialogKongsiProps) {
  const { DokumenID } = useParams<{ DokumenID: string }>()
  const availableUsers = useShareDocumentStore((state) => state.availableUsers)
  const currentApprovedUsers = useShareDocumentStore((state) => state.currentApprovedUsers)
  const setCurrentApprovedUsers = useShareDocumentStore((state) => state.setCurrentApprovedUsers)
  const [selectedShareUsers, setSelectedShareUsers] = useState<string[]>([])
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false)
  const [shareDropdownSearchValue, setShareDropdownSearchValue] = useState('')
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [shareProgress, setShareProgress] = useState<ProgressState>(null)
  const [shareErrorMessage, setShareErrorMessage] = useState<string | null>(null)
  const [isShareDialogHiddenForDelete, setIsShareDialogHiddenForDelete] = useState(false)
  const [isDeleteAccessDialogOpen, setIsDeleteAccessDialogOpen] = useState(false)
  const [accessUserToDelete, setAccessUserToDelete] = useState<{
    fullName: string
    email: string
  } | null>(null)
  const [isDeleteAccessSubmitting, setIsDeleteAccessSubmitting] = useState(false)
  const [deleteAccessErrorMessage, setDeleteAccessErrorMessage] = useState<string | null>(null)
  const [documentAccessUsers, setDocumentAccessUsers] = useState<ShareUser[]>([])

  const deleteDialogTransitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const shareDropdownContainerRef = useRef<HTMLDivElement | null>(null)
  const deleteOpenDelayMs = 180
  const deleteCloseDelayMs = 180

  const clearDeleteDialogTransitionTimer = () => {
    if (deleteDialogTransitionTimerRef.current) {
      clearTimeout(deleteDialogTransitionTimerRef.current)
      deleteDialogTransitionTimerRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      clearDeleteDialogTransitionTimer()
    }
  }, [])

  useEffect(() => {
    setDocumentAccessUsers(currentApprovedUsers ?? [])
  }, [currentApprovedUsers])

  useEffect(() => {
    if (!isShareDropdownOpen) {
      return
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const targetNode = event.target as Node

      if (shareDropdownContainerRef.current?.contains(targetNode)) {
        return
      }

      setIsShareDropdownOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isShareDropdownOpen])

  const dropdownSearchKeyword = shareDropdownSearchValue.trim().toLowerCase()
  const filteredUsers = (availableUsers ?? []).filter(({ fullName }) => {
    if (!dropdownSearchKeyword) {
      return true
    }

    const searchWords = dropdownSearchKeyword.split(/\s+/).filter(Boolean)
    const fullNameWords = fullName.toLowerCase().split(/\s+/)

    return searchWords.every((searchWord) =>
      fullNameWords.some((fullNameWord) => fullNameWord.includes(searchWord))
    )
  })

  const selectedShareUsersLabel = selectedShareUsers.length ? selectedShareUsers.join(', ') : ''

  const handleShareDropdownToggle = () => {
    setIsShareDropdownOpen((isOpen) => {
      if (isOpen) {
        return false
      }

      setShareDropdownSearchValue('')
      return true
    })
  }

  const toggleSelectedShareUser = (email: string) => {
    const nextSelectedUsers = selectedShareUsers.includes(email)
      ? selectedShareUsers.filter((selectedEmail) => selectedEmail !== email)
      : [...selectedShareUsers, email]

    setSelectedShareUsers(nextSelectedUsers)
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
      setIsShareDialogHiddenForDelete(false)
      setIsDeleteAccessDialogOpen(false)
      setAccessUserToDelete(null)
      clearDeleteDialogTransitionTimer()
    }
  }

  const handleBackToFormAfterShare = () => {
    setShareProgress(null)
    setShareErrorMessage(null)
  }

  const handleRetryShare = () => {
    setShareProgress(null)
    setShareErrorMessage(null)
  }

  const handleShareDokumen = async () => {
    setShareProgress('loading')
    setShareErrorMessage(null)
    setIsShareDropdownOpen(false)

    try {
      if (!DokumenID) {
        throw new Error('Dokumen ID tidak ditemui.')
      }

      if (selectedShareUsers.length === 0) {
        throw new Error('Sila pilih sekurang-kurangnya seorang pengguna.')
      }

      const updatedApprovedUsers = await shareSpecificRecord(DokumenID, selectedShareUsers)

      if (updatedApprovedUsers.length > 0) {
        setDocumentAccessUsers(updatedApprovedUsers)
        setCurrentApprovedUsers(updatedApprovedUsers)
      } else {
        const selectedUsersSet = new Set(selectedShareUsers)
        const selectedUsers = (availableUsers ?? []).filter((user) =>
          selectedUsersSet.has(user.email)
        )

        setDocumentAccessUsers((currentUsers) => {
          const dedupedUsers = [...currentUsers]

          selectedUsers.forEach((selectedUser) => {
            if (!dedupedUsers.some((currentUser) => currentUser.email === selectedUser.email)) {
              dedupedUsers.push(selectedUser)
            }
          })

          setCurrentApprovedUsers(dedupedUsers)
          return dedupedUsers
        })
      }

      setSelectedShareUsers([])

      // Refresh share data after successful share
      if (onShareDataRefresh) {
        await onShareDataRefresh()
      }

      setShareProgress('success')
    } catch (error) {
      const backendError = extractBackendError(error)
      const errorMessage =
        backendError?.message ??
        (error instanceof Error
          ? error.message
          : 'Kongsi dokumen gagal. Sila cuba lagi atau hubungi pentadbir.')

      setShareErrorMessage(errorMessage)
      setShareProgress('error')

      // Refresh share data even on error to ensure data consistency
      if (onShareDataRefresh) {
        await onShareDataRefresh()
      }
    }
  }

  const handleOpenDeleteAccessDialog = (fullName: string, email: string) => {
    setDeleteAccessErrorMessage(null)
    setAccessUserToDelete({ fullName, email })
    setIsShareDialogHiddenForDelete(true)
    clearDeleteDialogTransitionTimer()
    deleteDialogTransitionTimerRef.current = setTimeout(() => {
      setIsDeleteAccessDialogOpen(true)
      deleteDialogTransitionTimerRef.current = null
    }, deleteOpenDelayMs)
  }

  const handleDeleteAccessDialogOpenChange = (open: boolean) => {
    if (isDeleteAccessSubmitting && !open) {
      return
    }

    setIsDeleteAccessDialogOpen(open)

    if (!open) {
      setDeleteAccessErrorMessage(null)
      setAccessUserToDelete(null)
      clearDeleteDialogTransitionTimer()
      deleteDialogTransitionTimerRef.current = setTimeout(() => {
        setIsShareDialogHiddenForDelete(false)
        deleteDialogTransitionTimerRef.current = null
      }, deleteCloseDelayMs)
    }
  }

  const handleConfirmRemoveAccessUser = async () => {
    if (!accessUserToDelete || isDeleteAccessSubmitting) {
      return
    }

    setIsDeleteAccessSubmitting(true)
    setDeleteAccessErrorMessage(null)

    try {
      if (!DokumenID) {
        throw new Error('Dokumen ID tidak ditemui.')
      }

      const updatedApprovedUsers = await removeRecordSharing(DokumenID, [accessUserToDelete.email])

      if (updatedApprovedUsers.length > 0) {
        setDocumentAccessUsers(updatedApprovedUsers)
        setCurrentApprovedUsers(updatedApprovedUsers)
      } else {
        setDocumentAccessUsers((currentUsers) => {
          const nextUsers = currentUsers.filter(
            (accessUser) => accessUser.email !== accessUserToDelete.email
          )

          setCurrentApprovedUsers(nextUsers)
          return nextUsers
        })
      }

      setSelectedShareUsers((currentSelectedUsers) =>
        currentSelectedUsers.filter((selectedEmail) => selectedEmail !== accessUserToDelete.email)
      )

      setIsDeleteAccessDialogOpen(false)
      setAccessUserToDelete(null)
      clearDeleteDialogTransitionTimer()
      deleteDialogTransitionTimerRef.current = setTimeout(() => {
        setIsShareDialogHiddenForDelete(false)
        deleteDialogTransitionTimerRef.current = null
      }, deleteCloseDelayMs)

      // Refresh share data after successful delete
      if (onShareDataRefresh) {
        await onShareDataRefresh()
      }
    } catch (error) {
      const backendError = extractBackendError(error)
      const errorMessage =
        backendError?.message ??
        (error instanceof Error
          ? error.message
          : 'Padam akses pengguna gagal. Sila cuba lagi atau hubungi pentadbir.')

      setDeleteAccessErrorMessage(errorMessage)

      // Refresh share data even on error to ensure data consistency
      if (onShareDataRefresh) {
        await onShareDataRefresh()
      }
    } finally {
      setIsDeleteAccessSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={isShareDialogOpen} onOpenChange={handleShareDialogOpenChange}>
        <DialogTrigger>
          <Button variant="default-outline" size="small" className="gap-1.5">
            <ShareIcon className="size-4" />
            Kongsi
          </Button>
        </DialogTrigger>
        <DialogBody
          className={`w-full max-w-[calc(100dvw-36px)] transition-opacity duration-200 ease-out sm:max-w-2xl lg:max-w-4xl [&>button]:p-2 [&>button_svg]:size-4 ${isShareDialogHiddenForDelete ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
        >
          <DialogHeader className="pb-4.5">
            <DialogTitle>Kongsi Dokumen Ini</DialogTitle>
          </DialogHeader>
          <DialogContent className="border-t border-otl-gray-200 p-6 max-h-[600px] min-h-[500px] overflow-y-auto">
            <DialogDescription className="hidden">Dialog content goes here.</DialogDescription>
            {shareProgress ? (
              <div className="flex min-h-[500px] w-full items-center justify-center">
                <ProgressResultChecker
                  progress={shareProgress}
                  loadingDescription="Dokumen sedang dikongsi. Sila tunggu sebentar."
                  successTitle="Dokumen Berjaya Dikongsi"
                  successDescription="Dokumen telah berjaya dikongsi kepada pengguna yang dipilih."
                  successButtonText="Tambah Lagi Pengguna"
                  errorTitle="Dokumen Gagal Dikongsi"
                  errorDescription={
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <div>Kongsi dokumen tidak berjaya. Sila cuba lagi.</div>
                      <div>{shareErrorMessage ?? 'Permintaan kongsi dokumen gagal diproses.'}</div>
                    </div>
                  }
                  errorButtonText="Cuba Lagi"
                  onSuccessClick={handleBackToFormAfterShare}
                  onErrorClick={handleRetryShare}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <SelectionOfUser
                  shareDropdownContainerRef={shareDropdownContainerRef}
                  selectedShareUsers={selectedShareUsers}
                  selectedShareUsersLabel={selectedShareUsersLabel}
                  isShareDropdownOpen={isShareDropdownOpen}
                  filteredUsers={filteredUsers}
                  shareDropdownSearchValue={shareDropdownSearchValue}
                  onShareDropdownToggle={handleShareDropdownToggle}
                  onToggleSelectedShareUser={toggleSelectedShareUser}
                  onShareDropdownSearchChange={setShareDropdownSearchValue}
                  onShareDokumen={handleShareDokumen}
                />

                <AccessibleDocumentInfo
                  documentAccessUsers={documentAccessUsers}
                  isShareDropdownOpen={isShareDropdownOpen}
                  onOpenDeleteAccessDialog={handleOpenDeleteAccessDialog}
                />
              </div>
            )}
          </DialogContent>
        </DialogBody>
      </Dialog>
      <DialogUserDeletion
        open={isDeleteAccessDialogOpen}
        fullName={accessUserToDelete?.fullName}
        isSubmitting={isDeleteAccessSubmitting}
        errorMessage={deleteAccessErrorMessage}
        onOpenChange={handleDeleteAccessDialogOpenChange}
        onConfirm={handleConfirmRemoveAccessUser}
      />
    </>
  )
}
