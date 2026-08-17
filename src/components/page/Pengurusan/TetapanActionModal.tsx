import { useEffect, useRef, useState, type ReactNode } from 'react'
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

export type TetapanActionType = 'buang' | 'nyahaktif' | 'simpan' | 'kemaskini'

type ModalPhase = 'confirm' | 'loading' | 'success'

const ACTION_SIMULATION_DELAY_MS = 3000

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
}

export default function TetapanActionModal({
  action,
  onClose,
  onSuccess,
}: TetapanActionModalProps) {
  const [phase, setPhase] = useState<ModalPhase>('confirm')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearPendingTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  // Initialise the correct phase whenever a new action is opened. Actions
  // that don't require confirmation (Simpan/Kemaskini) skip straight to the
  // loading simulation.
  useEffect(() => {
    if (!action) return

    const config = ACTION_CONFIG[action]
    if (config.requireConfirm) {
      setPhase('confirm')
    } else {
      setPhase('loading')
      timeoutRef.current = setTimeout(() => {
        setPhase('success')
      }, ACTION_SIMULATION_DELAY_MS)
    }

    return clearPendingTimeout
  }, [action])

  const resetPhaseAfterClose = () => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setPhase('confirm')
      })
    })
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      // Prevent dismissing the modal while the action simulation is running
      if (phase === 'loading') {
        return
      }
      onClose()
      resetPhaseAfterClose()
    }
  }

  const handleConfirmClick = () => {
    setPhase('loading')
    timeoutRef.current = setTimeout(() => {
      setPhase('success')
    }, ACTION_SIMULATION_DELAY_MS)
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
        className="w-full max-w-[calc(100dvw-36px)] sm:max-w-[400px] [&>button]:p-1 [&>button_svg]:size-3.5"
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
        </DialogContent>
      </DialogBody>
    </Dialog>
  )
}
