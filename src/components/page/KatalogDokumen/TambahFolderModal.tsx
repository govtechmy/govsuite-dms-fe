import { useState } from 'react'
import { Button } from '@govtechmy/myds-react/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@govtechmy/myds-react/dialog'
import { Input } from '@govtechmy/myds-react/input'
import { Callout, CalloutContent, CalloutTitle } from '@govtechmy/myds-react/callout'
import { Spinner } from '@govtechmy/myds-react/spinner'
import { clx } from '@govtechmy/myds-react/utils'

interface TambahFolderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddFolder: (folderName: string) => Promise<boolean>
  existingFolders: string[]
  trigger?: React.ReactNode
}

export default function TambahFolderModal({
  open,
  onOpenChange,
  onAddFolder,
  existingFolders,
  trigger,
}: TambahFolderModalProps) {
  const [folderName, setFolderName] = useState<string>('')
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [showError, setShowError] = useState<boolean>(false)

  const handleDialogOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      // Reset state when dialog closes
      setFolderName('')
      setShowError(false)
      setIsCreating(false)
    }
  }

  const handleAddFolder = async () => {
    const trimmedName = folderName.trim()
    if (!trimmedName) return

    // Check if folder name already exists
    const folderExists = existingFolders.some(
      (name) => name.toLowerCase() === trimmedName.toLowerCase()
    )

    if (folderExists) {
      setShowError(true)
      return
    }

    // Show loading state
    setIsCreating(true)
    setShowError(false)

    try {
      const isSuccess = await onAddFolder(trimmedName)

      if (!isSuccess) {
        setIsCreating(false)
        return
      }

      setIsCreating(false)
      setFolderName('')
      setShowError(false)
      onOpenChange(false)
    } catch {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      {trigger && <DialogTrigger>{trigger}</DialogTrigger>}
      <DialogBody
        hideClose={isCreating}
        className={clx(isCreating && 'items-center justify-center flex')}
      >
        {!isCreating && (
          <DialogHeader className="pb-[18px]">
            <DialogTitle>Tambah Folder</DialogTitle>
          </DialogHeader>
        )}

        <DialogContent
          className={clx(
            'p-6 flex flex-col gap-6 border-b border-t border-otl-gray-200 ',
            isCreating && 'border-none'
          )}
        >
          {/* for myds issue for throwing error */}
          <DialogDescription className="hidden">Dialog content goes here.</DialogDescription>

          {isCreating ? (
            <div className="items-center justify-center flex flex-col gap-3 py-6 min-h-[350px]">
              <Spinner size={'large'} />
              <div className="font-body font-normal text-sm text-txt-black-700">
                Folder Sedang Dicipta
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <div>Nama Folder</div>
                <Input
                  placeholder="Nama Folder"
                  value={folderName}
                  onChange={(e) => {
                    setFolderName(e.target.value)
                    setShowError(false)
                  }}
                />
              </div>
              {!showError && (
                <Callout>
                  <CalloutTitle>Informasi</CalloutTitle>
                  <CalloutContent>
                    Nama folder mestilah unik dan tidak boleh sama dengan folder yang sedia ada di
                    dalam unit/folder ini.
                  </CalloutContent>
                </Callout>
              )}
              {showError && (
                <Callout variant={'danger'}>
                  <CalloutTitle>Ralat</CalloutTitle>
                  <CalloutContent>
                    Nama folder ini telah wujud. Sila gunakan nama lain.
                  </CalloutContent>
                </Callout>
              )}
            </>
          )}
        </DialogContent>
        {!isCreating && (
          <DialogFooter>
            <DialogClose>
              <Button variant="default-outline" disabled={isCreating}>
                Batalkan
              </Button>
            </DialogClose>
            <Button
              variant="primary-fill"
              disabled={!folderName.trim() || isCreating}
              onClick={() => {
                void handleAddFolder()
              }}
            >
              Tambah Folder
            </Button>
          </DialogFooter>
        )}
      </DialogBody>
    </Dialog>
  )
}
