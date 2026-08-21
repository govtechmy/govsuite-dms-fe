import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@govtechmy/myds-react/button'
import { Input } from '@govtechmy/myds-react/input'
import { CheckCircleIcon, CrossCircleIcon, WarningCircleIcon } from '@govtechmy/myds-react/icon'
import { Spinner } from '@govtechmy/myds-react/spinner'
import { clx } from '@govtechmy/myds-react/utils'
import { useToast } from '@govtechmy/myds-react/hooks'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@govtechmy/myds-react/dialog'
import { Eye, EyeOff } from '@/assets/Icons/Eye'
import { changePassword } from '@/services/auth.svc'
import { useAuthStore } from '@/store/AuthStore'
import extractBackendError from '@/utils/extractBackendError'

const PASSWORD_MIN_LENGTH = 12
// Delay before the forced-logout modal appears after a successful password change.
const LOGOUT_MODAL_DELAY_MS = 2000
// Countdown (in seconds) shown on the forced-logout modal before the session ends.
const LOGOUT_COUNTDOWN_SECONDS = 3

interface PasswordRequirement {
  key: string
  label: string
  test: (value: string) => boolean
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    key: 'length',
    label: `Sekurang-kurangnya ${PASSWORD_MIN_LENGTH} aksara`,
    test: (value) => value.length >= PASSWORD_MIN_LENGTH,
  },
  {
    key: 'uppercase',
    label: 'Sekurang-kurangnya 1 huruf besar (A-Z)',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    key: 'lowercase',
    label: 'Sekurang-kurangnya 1 huruf kecil (a-z)',
    test: (value) => /[a-z]/.test(value),
  },
  {
    key: 'number',
    label: 'Sekurang-kurangnya 1 nombor (0-9)',
    test: (value) => /[0-9]/.test(value),
  },
  {
    key: 'specialChar',
    label: 'Sekurang-kurangnya 1 aksara khas (cth: ! @ # $ %)',
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
]

export default function ResetPassword() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [logoutCountdown, setLogoutCountdown] = useState(LOGOUT_COUNTDOWN_SECONDS)
  const logoutModalDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clear the pending forced-logout timer if the component unmounts before it fires.
  useEffect(() => {
    return () => {
      if (logoutModalDelayRef.current) {
        clearTimeout(logoutModalDelayRef.current)
      }
    }
  }, [])

  // Once the forced-logout modal is shown, tick the countdown down every second
  // and log the user out (with no way to cancel) once it reaches zero.
  useEffect(() => {
    if (!showLogoutModal) return

    if (logoutCountdown <= 0) {
      logout()
      navigate(`/${localStorage.getItem('lang') || 'ms'}/login`)
      return
    }

    const tickId = setTimeout(() => {
      setLogoutCountdown((value) => value - 1)
    }, 1000)

    return () => clearTimeout(tickId)
  }, [showLogoutModal, logoutCountdown, logout, navigate])

  const requirementResults = useMemo(
    () =>
      PASSWORD_REQUIREMENTS.map((requirement) => ({
        ...requirement,
        isMet: requirement.test(newPassword),
      })),
    [newPassword]
  )
  const isPasswordPolicyMet = requirementResults.every((requirement) => requirement.isMet)

  const isConfirmMismatch = confirmPassword.trim() !== '' && confirmPassword !== newPassword
  const isFormValid =
    isPasswordPolicyMet && confirmPassword.trim() !== '' && newPassword === confirmPassword

  const handleResetPasswordClick = async () => {
    if (!isFormValid || isSubmitting) return

    setIsSubmitting(true)
    try {
      const message = await changePassword(newPassword)
      toast({
        variant: 'success',
        title: 'Kata Laluan Berjaya Dikemaskini',
        description: message,
      })
      setNewPassword('')
      setConfirmPassword('')

      // Session is invalidated by the backend after a password change — force
      // the user out once they've had a moment to see the success toast.
      logoutModalDelayRef.current = setTimeout(() => {
        setLogoutCountdown(LOGOUT_COUNTDOWN_SECONDS)
        setShowLogoutModal(true)
      }, LOGOUT_MODAL_DELAY_MS)
    } catch (error) {
      const backendError = extractBackendError(error)
      toast({
        variant: 'error',
        title: 'Kata Laluan Gagal Dikemaskini',
        description: `${backendError?.code ?? 'REQUEST_FAILED'} : ${
          backendError?.message ?? 'Sila cuba lagi.'
        }`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="font-body font-semibold text-body-md">Set Semula Kata Laluan</div>
      <div className="flex flex-col gap-6 text-body-md font-medium font-body text-txt-black-700 max-w-[460px]">
        <div className="flex flex-col gap-1.5">
          <div className="flex text-body-md">
            Kata Laluan Baru <div className="text-txt-danger">*</div>
          </div>
          <div className="relative">
            <Input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Masukkan Kata Laluan Baru"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="font-normal"
            >
              <button
                type="button"
                aria-label={showNewPassword ? 'Sembunyikan kata laluan' : 'Papar kata laluan'}
                onClick={() => setShowNewPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-black-400 hover:text-txt-black-700 focus:outline-none"
                tabIndex={0}
              >
                {showNewPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </Input>
          </div>
          <ul className="flex flex-col gap-1 pt-1">
            {requirementResults.map((requirement) => (
              <li
                key={requirement.key}
                className={clx(
                  'flex items-center gap-2 text-body-sm font-normal',
                  requirement.isMet ? 'text-txt-success' : 'text-txt-black-500'
                )}
              >
                {requirement.isMet ? (
                  <CheckCircleIcon className="size-4 shrink-0" />
                ) : (
                  <CrossCircleIcon className="size-4 shrink-0" />
                )}
                {requirement.label}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex">
            Sahkan Kata Laluan Baru <div className="text-txt-danger">*</div>
          </div>
          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Sahkan kata laluan baru"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="font-normal"
            >
              <button
                type="button"
                aria-label={showConfirmPassword ? 'Sembunyikan kata laluan' : 'Papar kata laluan'}
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-black-400 hover:text-txt-black-700 focus:outline-none"
                tabIndex={0}
              >
                {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </Input>
          </div>
          {isConfirmMismatch && (
            <div className="text-body-sm text-danger-700">
              Kata laluan tidak sepadan dengan kata laluan baru.
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-start">
        <Button
          variant="primary-fill"
          size={'medium'}
          disabled={!isFormValid || isSubmitting}
          onClick={handleResetPasswordClick}
          className="mt-2"
        >
          {isSubmitting ? (
            <>
              <Spinner className="w-4 h-4 mr-2" />
              Mengemaskini...
            </>
          ) : (
            'Kemaskini Kata Laluan'
          )}
        </Button>
      </div>

      <Dialog open={showLogoutModal} onOpenChange={() => {}}>
        <DialogBody
          hideClose
          dismissible={false}
          className="w-full max-w-[calc(100dvw-36px)] sm:max-w-[400px]"
        >
          <DialogContent className="flex flex-col items-center py-8 text-center">
            <WarningCircleIcon className="text-txt-warning size-[42px]" />
            <DialogTitle className="pt-[16px]">Kata Laluan Berjaya Dikemaskini</DialogTitle>
            <DialogDescription>
              Untuk keselamatan akaun anda, anda akan dilog keluar secara automatik dalam{' '}
              {logoutCountdown} saat. Sila log masuk semula menggunakan kata laluan baharu anda.
            </DialogDescription>
          </DialogContent>
        </DialogBody>
      </Dialog>
    </div>
  )
}
