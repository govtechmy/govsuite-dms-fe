import { useState } from 'react'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@govtechmy/myds-react/dialog'
import { Button } from '@govtechmy/myds-react/button'
import { Spinner } from '@govtechmy/myds-react/spinner'
import { CheckCircleIcon, LockIcon, WarningIcon } from '@govtechmy/myds-react/icon'
import { resetPenggunaPassword, type PenggunaItem } from '@/services/pengurusanPengguna.svc'
import extractBackendError from '@/utils/extractBackendError'

type ModalPhase = 'confirm' | 'loading' | 'success' | 'error'

interface ResetKataLaluanModalProps {
  pengguna: PenggunaItem
  onSuccess?: () => void
}

interface ResetErrorState {
  code: string
  message: string
}

export default function ResetKataLaluanModal({ pengguna, onSuccess }: ResetKataLaluanModalProps) {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<ModalPhase>('confirm')
  const [error, setError] = useState<ResetErrorState | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && phase === 'loading') {
      // Prevent dismissing the modal while the reset request is in flight
      return
    }
    setOpen(nextOpen)
    setPhase('confirm')
    setError(null)
    setSuccessMessage(null)
  }

  const handleBatalkanClick = () => {
    setOpen(false)
    setPhase('confirm')
    setError(null)
  }

  const handleConfirmResetClick = async () => {
    setPhase('loading')
    try {
      const result = await resetPenggunaPassword(pengguna.id)
      setSuccessMessage(result?.message ?? null)
      setPhase('success')
    } catch (err) {
      const backendError = extractBackendError(err)
      setError({
        code: backendError?.code ?? 'REQUEST_FAILED',
        message: backendError?.message ?? 'Kata laluan gagal ditetapkan semula.',
      })
      setPhase('error')
    }
  }

  const handleCubaLagiClick = () => {
    setError(null)
    setPhase('confirm')
  }

  const handleTutupClick = () => {
    // Only refresh the list once the user dismisses the success dialog — refreshing
    // immediately on success would flip the table into its loading skeleton and
    // unmount this still-open dialog before the user gets to see it.
    const wasSuccess = phase === 'success'
    setOpen(false)
    setPhase('confirm')
    setError(null)
    setSuccessMessage(null)
    if (wasSuccess) {
      onSuccess?.()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <Button variant="danger-outline" size="small">
          <LockIcon />
          Reset
        </Button>
      </DialogTrigger>
      <DialogBody
        hideClose={phase === 'loading'}
        className="w-full max-w-[calc(100dvw-36px)] sm:max-w-[400px] [&>button]:p-1 [&>button_svg]:size-3.5"
      >
        <DialogDescription className="hidden">Dialog content goes here.</DialogDescription>

        {phase === 'confirm' && (
          <DialogContent className="flex flex-col items-center py-8 text-center">
            <WarningIcon className="text-txt-danger size-[42px]" />
            <DialogTitle className="pt-[16px]">Reset Kata Laluan?</DialogTitle>
            <DialogDescription>
              Adakah anda pasti untuk menetapkan semula kata laluan bagi{' '}
              {pengguna.fullName || 'pengguna ini'}?
            </DialogDescription>
            <div className="mt-6 flex w-full gap-2">
              <Button
                size={'large'}
                variant="default-outline"
                className="w-full items-center justify-center"
                onClick={handleBatalkanClick}
              >
                Batalkan
              </Button>
              <Button
                size={'large'}
                variant="danger-fill"
                className="w-full items-center justify-center"
                onClick={() => {
                  void handleConfirmResetClick()
                }}
              >
                Reset
              </Button>
            </div>
          </DialogContent>
        )}

        {phase === 'loading' && (
          <DialogContent className="flex flex-col items-center justify-center gap-3 py-12">
            <Spinner size={'large'} />
            <div className="text-body-sm font-normal text-txt-black-700">
              Kata Laluan Sedang Ditetapkan Semula
            </div>
          </DialogContent>
        )}

        {phase === 'success' && (
          <DialogContent className="flex flex-col items-center py-8 text-center">
            <CheckCircleIcon className="text-txt-success size-[42px]" />
            <DialogTitle className="pt-[16px]">Kata Laluan Berjaya Ditetapkan Semula</DialogTitle>
            <DialogDescription>
              {successMessage ??
                `Kata laluan bagi ${pengguna.fullName || 'pengguna ini'} telah berjaya ditetapkan semula.`}
            </DialogDescription>
            <Button
              size={'large'}
              variant="default-outline"
              className="mt-6 w-full items-center justify-center"
              onClick={handleTutupClick}
            >
              Tutup
            </Button>
          </DialogContent>
        )}

        {phase === 'error' && (
          <DialogContent className="flex flex-col items-center py-8 text-center">
            <WarningIcon className="text-txt-danger size-[42px]" />
            <DialogTitle className="pt-[16px]">Gagal Menetapkan Semula Kata Laluan</DialogTitle>
            <DialogDescription>
              {error?.code ?? 'REQUEST_FAILED'} :{' '}
              {error?.message ?? 'Kata laluan gagal ditetapkan semula. Sila cuba lagi.'}
            </DialogDescription>
            <div className="mt-6 flex w-full gap-2">
              <Button
                size={'large'}
                variant="default-outline"
                className="w-full items-center justify-center"
                onClick={handleTutupClick}
              >
                Tutup
              </Button>
              <Button
                size={'large'}
                variant="primary-fill"
                className="w-full items-center justify-center"
                onClick={handleCubaLagiClick}
              >
                Cuba Lagi
              </Button>
            </div>
          </DialogContent>
        )}
      </DialogBody>
    </Dialog>
  )
}
