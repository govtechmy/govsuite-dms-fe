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
import ProgressResultChecker, { type ProgressState } from '@/components/shared/ProgressResult'
import DialogUserDeletion from './DialogUserDeletion'
import AccessibleDocumentInfo, { type AccessibleDocumentUser } from './AccessibleDocumentInfo'
import SelectionOfUser from './SelectionOfUser'

const user: AccessibleDocumentUser[] = [
  { username: 'Nur Aisyah Hamdan', email: 'nur.aisyah.hamdan@digital.gov.my' },
  { username: 'Muhammad Faris Rahman', email: 'muhammad.faris.rahman@digital.gov.my' },
  { username: 'Siti Hajar Zulkifli', email: 'siti.hajar.zulkifli@digital.gov.my' },
  { username: 'Amirul Hakim Salleh', email: 'amirul.hakim.salleh@digital.gov.my' },
  { username: 'Aina Sofea Ismail', email: 'aina.sofea.ismail@digital.gov.my' },
  { username: 'Khairul Anuar Othman', email: 'khairul.anuar.othman@digital.gov.my' },
  { username: 'Nabila Syafiqah Rosli', email: 'nabila.syafiqah.rosli@digital.gov.my' },
  { username: 'Daniel Irfan Abdullah', email: 'daniel.irfan.abdullah@digital.gov.my' },
  { username: 'Hana Izzati Yusof', email: 'hana.izzati.yusof@digital.gov.my' },
  { username: 'Syed Aiman Faiz', email: 'syed.aiman.faiz@digital.gov.my' },
  { username: 'Balqis Nadia Jalil', email: 'balqis.nadia.jalil@digital.gov.my' },
  { username: 'Rafiq Zaim Ibrahim', email: 'rafiq.zaim.ibrahim@digital.gov.my' },
  { username: 'Intan Suraya Kamaruddin', email: 'intan.suraya.kamaruddin@digital.gov.my' },
  { username: 'Haziq Firdaus Mahmood', email: 'haziq.firdaus.mahmood@digital.gov.my' },
  { username: 'Nurul Iman Adnan', email: 'nurul.iman.adnan@digital.gov.my' },
  { username: 'Azlan Fikri Yaakob', email: 'azlan.fikri.yaakob@digital.gov.my' },
  { username: 'Sofia Humaira Aziz', email: 'sofia.humaira.aziz@digital.gov.my' },
  { username: 'Hakim Danish Razak', email: 'hakim.danish.razak@digital.gov.my' },
  { username: 'Qistina Aleeya Musa', email: 'qistina.aleeya.musa@digital.gov.my' },
  { username: 'Faizal Harith Noor', email: 'faizal.harith.noor@digital.gov.my' },
  { username: 'Mira Adlina Hashim', email: 'mira.adlina.hashim@digital.gov.my' },
  { username: 'Arif Iqbal Karim', email: 'arif.iqbal.karim@digital.gov.my' },
  { username: 'Alya Batrisyia Ghani', email: 'alya.batrisyia.ghani@digital.gov.my' },
  { username: 'Zulhelmi Aqil Omar', email: 'zulhelmi.aqil.omar@digital.gov.my' },
  { username: 'Nurin Athirah Sidek', email: 'nurin.athirah.sidek@digital.gov.my' },
  { username: 'Irfan Luqman Shah', email: 'irfan.luqman.shah@digital.gov.my' },
  { username: 'Aqilah Najwa Bakar', email: 'aqilah.najwa.bakar@digital.gov.my' },
  { username: 'Rizwan Hilmi Mokhtar', email: 'rizwan.hilmi.mokhtar@digital.gov.my' },
  { username: 'Yasmin Dahlia Latif', email: 'yasmin.dahlia.latif@digital.gov.my' },
  { username: 'Fikri Haziem Nordin', email: 'fikri.haziem.nordin@digital.gov.my' },
]

export default function DialogKongsi() {
  const [selectedShareUsers, setSelectedShareUsers] = useState<string[]>([])
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false)
  const [shareDropdownSearchValue, setShareDropdownSearchValue] = useState('')
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [shareProgress, setShareProgress] = useState<ProgressState>(null)
  const [shareErrorMessage, setShareErrorMessage] = useState<string | null>(null)
  const [isShareDialogHiddenForDelete, setIsShareDialogHiddenForDelete] = useState(false)
  const [isDeleteAccessDialogOpen, setIsDeleteAccessDialogOpen] = useState(false)
  const [accessUserToDelete, setAccessUserToDelete] = useState<{
    username: string
    email: string
  } | null>(null)
  const [documentAccessUsers, setDocumentAccessUsers] = useState(user)

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

  const filteredUsers = user.filter(({ username }) => {
    if (!dropdownSearchKeyword) {
      return true
    }

    const searchWords = dropdownSearchKeyword.split(/\s+/).filter(Boolean)
    const usernameWords = username.toLowerCase().split(/\s+/)

    return searchWords.every((searchWord) =>
      usernameWords.some((usernameWord) => usernameWord.includes(searchWord))
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

  const handleRemoveAccessUser = (email: string) => {
    setDocumentAccessUsers((currentUsers) =>
      currentUsers.filter((accessUser) => accessUser.email !== email)
    )
    setSelectedShareUsers((currentSelectedUsers) =>
      currentSelectedUsers.filter((selectedEmail) => selectedEmail !== email)
    )
  }

  const handleOpenDeleteAccessDialog = (username: string, email: string) => {
    setAccessUserToDelete({ username, email })
    setIsShareDialogHiddenForDelete(true)
    clearDeleteDialogTransitionTimer()
    deleteDialogTransitionTimerRef.current = setTimeout(() => {
      setIsDeleteAccessDialogOpen(true)
      deleteDialogTransitionTimerRef.current = null
    }, deleteOpenDelayMs)
  }

  const handleDeleteAccessDialogOpenChange = (open: boolean) => {
    setIsDeleteAccessDialogOpen(open)

    if (!open) {
      setAccessUserToDelete(null)
      clearDeleteDialogTransitionTimer()
      deleteDialogTransitionTimerRef.current = setTimeout(() => {
        setIsShareDialogHiddenForDelete(false)
        deleteDialogTransitionTimerRef.current = null
      }, deleteCloseDelayMs)
    }
  }

  const handleConfirmRemoveAccessUser = () => {
    if (accessUserToDelete) {
      handleRemoveAccessUser(accessUserToDelete.email)
    }

    setIsDeleteAccessDialogOpen(false)
    setAccessUserToDelete(null)
    clearDeleteDialogTransitionTimer()
    deleteDialogTransitionTimerRef.current = setTimeout(() => {
      setIsShareDialogHiddenForDelete(false)
      deleteDialogTransitionTimerRef.current = null
    }, deleteCloseDelayMs)
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
                  successButtonText="Tutup"
                  errorTitle="Dokumen Gagal Dikongsi"
                  errorDescription={
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <div>Kongsi dokumen tidak berjaya. Sila cuba lagi.</div>
                      <div>{shareErrorMessage ?? 'Permintaan kongsi dokumen gagal diproses.'}</div>
                    </div>
                  }
                  errorButtonText="Cuba Lagi"
                  onSuccessClick={handleCloseShareProgress}
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
        username={accessUserToDelete?.username}
        onOpenChange={handleDeleteAccessDialogOpenChange}
        onConfirm={handleConfirmRemoveAccessUser}
      />
    </>
  )
}
