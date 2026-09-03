import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WarningCircleIcon } from '@govtechmy/myds-react/icon'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@govtechmy/myds-react/dialog'
import { useAuthStore } from '@/store/AuthStore'

// Countdown (in seconds) shown on the forced-logout modal before the session ends.
const LOGOUT_COUNTDOWN_SECONDS = 3

interface ForcedLogoutDialogProps {
  open: boolean
  title?: string
  description?: string
}

/**
 * Non-dismissible modal shown after a password change that invalidates the
 * current session. Counts down and forces the user back to the login page,
 * with no way to cancel or close the dialog.
 */
export default function ForcedLogoutDialog({
  open,
  title = 'Kata Laluan Berjaya Dikemaskini',
  description,
}: ForcedLogoutDialogProps) {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const [logoutCountdown, setLogoutCountdown] = useState(LOGOUT_COUNTDOWN_SECONDS)

  // Reset the countdown whenever the dialog is (re)opened.
  useEffect(() => {
    if (open) {
      setLogoutCountdown(LOGOUT_COUNTDOWN_SECONDS)
    }
  }, [open])

  // Tick the countdown down every second and log the user out (with no way
  // to cancel) once it reaches zero.
  useEffect(() => {
    if (!open) return

    if (logoutCountdown <= 0) {
      logout()
      navigate(`/${localStorage.getItem('lang') || 'ms'}/login`)
      return
    }

    const tickId = setTimeout(() => {
      setLogoutCountdown((value) => value - 1)
    }, 1000)

    return () => clearTimeout(tickId)
  }, [open, logoutCountdown, logout, navigate])

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogBody
        hideClose
        dismissible={false}
        className="w-full max-w-[calc(100dvw-36px)] sm:max-w-[400px]"
      >
        <DialogContent className="flex flex-col items-center py-8 text-center">
          <WarningCircleIcon className="text-txt-warning size-[42px]" />
          <DialogTitle className="pt-[16px]">{title}</DialogTitle>
          <DialogDescription>
            {description ?? (
              <>
                Untuk keselamatan akaun anda, anda akan dilog keluar secara automatik dalam{' '}
                {logoutCountdown} saat. Sila log masuk semula menggunakan kata laluan baharu anda.
              </>
            )}
          </DialogDescription>
        </DialogContent>
      </DialogBody>
    </Dialog>
  )
}
