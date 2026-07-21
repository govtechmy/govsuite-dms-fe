import { Button } from '@govtechmy/myds-react/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@govtechmy/myds-react/dialog'

interface DialogUserDeletionProps {
  open: boolean
  fullName?: string
  isSubmitting?: boolean
  errorMessage?: string | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export default function DialogUserDeletion({
  open,
  fullName,
  isSubmitting = false,
  errorMessage = null,
  onOpenChange,
  onConfirm,
}: DialogUserDeletionProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogBody className="w-[400px] [&>button]:p-2 [&>button_svg]:size-4">
        <DialogContent className="py-6">
          <DialogTitle className="pt-[16px]">Padam Pengguna</DialogTitle>
          <DialogDescription>
            Anda pasti mahu padam akses untuk {fullName ?? 'pengguna'}?
          </DialogDescription>
          {errorMessage ? (
            <div className="pt-4 text-body-sm font-normal text-txt-danger">{errorMessage}</div>
          ) : null}
          <div className="flex gap-2 pt-6">
            <DialogClose className="flex-1" disabled={isSubmitting}>
              <Button
                size="large"
                variant="default-outline"
                className="w-full items-center justify-center"
                disabled={isSubmitting}
              >
                Batalkan
              </Button>
            </DialogClose>
            <Button
              size="large"
              variant="danger-fill"
              className="w-full flex-1 items-center justify-center"
              disabled={isSubmitting}
              onClick={onConfirm}
            >
              {isSubmitting ? 'Memadam...' : 'Padam'}
            </Button>
          </div>
        </DialogContent>
      </DialogBody>
    </Dialog>
  )
}
