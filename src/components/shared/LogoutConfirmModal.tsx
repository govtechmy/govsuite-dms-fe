import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@govtechmy/myds-react/dialog'
import { Button } from '@govtechmy/myds-react/button'

interface LogoutConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  iconPasser?: React.ReactNode
}

export default function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Log Keluar',
  description = 'Anda Pasti mahu log keluar?',
  iconPasser,
}: LogoutConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogBody className="w-[400px] [&>button]:p-1 [&>button_svg]:size-3.5" onDismiss={onClose}>
        <DialogContent className="py-6">
          {iconPasser}
          <DialogTitle className="pt-[16px]">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          <div className="flex gap-2 pt-6">
            <DialogClose className="flex-1">
              <Button
                size={'large'}
                variant="default-outline"
                className="w-full items-center justify-center"
              >
                Batalkan
              </Button>
            </DialogClose>
            <DialogClose className="flex-1">
              <Button
                size={'large'}
                variant="danger-fill"
                className="w-full items-center justify-center"
                onClick={onConfirm}
              >
                Log Keluar
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </DialogBody>
    </Dialog>
  )
}
