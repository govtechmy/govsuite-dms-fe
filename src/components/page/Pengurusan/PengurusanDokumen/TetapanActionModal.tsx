import { useEffect, useState, type ReactNode } from 'react'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@govtechmy/myds-react/dialog'
import { Button, type ButtonProps } from '@govtechmy/myds-react/button'
import { CheckCircleIcon, WarningIcon } from '@govtechmy/myds-react/icon'
import { Spinner } from '@govtechmy/myds-react/spinner'
import extractBackendError from '@/utils/extractBackendError'

export type TetapanActionType = 'buang' | 'nyahaktif' | 'aktifkan' | 'simpan' | 'kemaskini'

type ModalPhase = 'confirm' | 'loading' | 'success' | 'error'

interface TetapanActionConfig {
  requireConfirm: boolean
  confirmIcon?: ReactNode
  confirmTitle?: string
  confirmDescription?: string
  confirmButtonText?: string
  confirmButtonVariant?: ButtonProps['variant']
  loadingDescription: string
  successTitle: string
  successDescription: string
}

const ACTION_CONFIG: Record<TetapanActionType, TetapanActionConfig> = {
  buang: {
    requireConfirm: true,
    confirmIcon: <WarningIcon className="text-txt-danger size-[42px]" />,
    confirmTitle: 'Buang Tetapan?',
    confirmDescription: 'Adakah anda pasti untuk meneruskan tindakan ini?',
    confirmButtonText: 'Buang',
    confirmButtonVariant: 'danger-fill',
    loadingDescription: 'Dokumen sedang dibuang.',
    successTitle: 'Tetapan Berjaya Dibuang',
    successDescription: 'Tetapan telah berjaya dibuang daripada sistem.',
  },
  nyahaktif: {
    requireConfirm: true,
    confirmIcon: <WarningIcon className="text-primary-600 size-[42px]" />,
    confirmTitle: 'Nyahaktifkan Tetapan?',
    confirmDescription:
      'Adakah anda pasti untuk menyahaktifkan tetapan ini? Tetapan yang dinyahaktifkan tidak akan digunakan sehingga diaktifkan semula.',
    confirmButtonText: 'Nyahaktifkan',
    confirmButtonVariant: 'primary-fill',
    loadingDescription: 'Tetapan sedang dinyahaktifkan.',
    successTitle: 'Tetapan Berjaya Dinyahaktifkan',
    successDescription: 'Tetapan ini kini tidak aktif.',
  },
  aktifkan: {
    requireConfirm: true,
    confirmIcon: <WarningIcon className="text-primary-600 size-[42px]" />,
    confirmTitle: 'Aktifkan Tetapan?',
    confirmDescription: 'Adakah anda pasti untuk mengaktifkan tetapan ini?',
    confirmButtonText: 'Aktifkan',
    confirmButtonVariant: 'primary-fill',
    loadingDescription: 'Tetapan sedang diaktifkan.',
    successTitle: 'Tetapan Berjaya Diaktifkan',
    successDescription: 'Tetapan ini kini aktif.',
  },
  simpan: {
    requireConfirm: false,
    loadingDescription: 'Tetapan sedang disimpan.',
    successTitle: 'Tetapan Berjaya Disimpan',
    successDescription: 'Tetapan baharu telah berjaya disimpan.',
  },
  kemaskini: {
    requireConfirm: false,
    loadingDescription: 'Tetapan sedang dikemaskini.',
    successTitle: 'Tetapan Berjaya Dikemaskini',
    successDescription: 'Perubahan pada tetapan telah berjaya disimpan.',
  },
}

interface TetapanActionModalProps {
  action: TetapanActionType | null
  onClose: () => void
  onSuccess?: (action: TetapanActionType) => void
  /** Performs the actual action; the loading phase awaits this and surfaces
   * a retryable error phase on failure. */
  onConfirm: () => Promise<void>
}

export default function TetapanActionModal({
  action,
  onClose,
  onSuccess,
  onConfirm,
}: TetapanActionModalProps) {
  const [phase, setPhase] = useState<ModalPhase>('confirm')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const runAction = () => {
    setPhase('loading')
    setErrorMessage(null)

    onConfirm()
      .then(() => setPhase('success'))
      .catch((err) => {
        setErrorMessage(extractBackendError(err)?.message ?? 'Tindakan gagal. Sila cuba lagi.')
        setPhase('error')
      })
  }

  // Initialise the correct phase whenever a new action is opened. Actions
  // that don't require confirmation (Simpan/Kemaskini) skip straight to the
  // loading phase.
  useEffect(() => {
    if (!action) return

    const config = ACTION_CONFIG[action]
    if (config.requireConfirm) {
      setPhase('confirm')
    } else {
      runAction()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action])

  const resetPhaseAfterClose = () => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setPhase('confirm')
        setErrorMessage(null)
      })
    })
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      // Prevent dismissing the modal while the action is running
      if (phase === 'loading') {
        return
      }
      onClose()
      resetPhaseAfterClose()
    }
  }

  const handleConfirmClick = () => {
    runAction()
  }

  const handleTutupFromError = () => {
    onClose()
    resetPhaseAfterClose()
  }

  const handleTutupClick = () => {
    const completedAction = action
    onClose()
    resetPhaseAfterClose()
    if (completedAction) {
      onSuccess?.(completedAction)
    }
  }

  if (!action) {
    return null
  }

  const config = ACTION_CONFIG[action]

  return (
    <Dialog open={!!action} onOpenChange={handleOpenChange}>
      <DialogBody
        hideClose
        className="w-full max-w-[calc(100dvw-36px)] sm:max-w-[400px]"
        onDismiss={phase === 'loading' ? undefined : onClose}
      >
        <DialogContent className="py-6">
          {phase === 'confirm' && (
            <>
              {config.confirmIcon}
              <DialogTitle className="pt-[16px]">{config.confirmTitle}</DialogTitle>
              <DialogDescription>{config.confirmDescription}</DialogDescription>
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
                <Button
                  size={'large'}
                  variant={config.confirmButtonVariant}
                  className="flex-1 w-full items-center justify-center"
                  onClick={handleConfirmClick}
                >
                  {config.confirmButtonText}
                </Button>
              </div>
            </>
          )}

          {phase === 'loading' && (
            <div className="flex flex-col items-center justify-center gap-3 py-6">
              <Spinner size={'large'} />
              <div className="text-body-sm font-normal text-txt-black-700">
                {config.loadingDescription}
              </div>
            </div>
          )}

          {phase === 'success' && (
            <>
              <CheckCircleIcon className="text-txt-success size-[42px]" />
              <DialogTitle className="pt-[16px]">{config.successTitle}</DialogTitle>
              <DialogDescription>{config.successDescription}</DialogDescription>
              <div className="flex gap-2 pt-6">
                <Button
                  size={'large'}
                  variant="default-outline"
                  className="w-full items-center justify-center"
                  onClick={handleTutupClick}
                >
                  Tutup
                </Button>
              </div>
            </>
          )}

          {phase === 'error' && (
            <>
              <WarningIcon className="text-txt-danger size-[42px]" />
              <DialogTitle className="pt-[16px]">Tindakan Gagal</DialogTitle>
              <DialogDescription>
                {errorMessage ?? 'Tindakan gagal. Sila cuba lagi.'}
              </DialogDescription>
              <div className="flex flex-row gap-2 pt-6">
                <Button
                  size={'large'}
                  variant="default-outline"
                  className="items-center justify-center"
                  onClick={handleTutupFromError}
                >
                  Tutup
                </Button>
                <Button
                  size={'large'}
                  variant="primary-fill"
                  className="items-center justify-center"
                  onClick={runAction}
                >
                  Cuba Lagi
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </DialogBody>
    </Dialog>
  )
}
