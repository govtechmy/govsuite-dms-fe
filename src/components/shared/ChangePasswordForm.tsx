import { useEffect, useRef, useState } from 'react'
import { Button } from '@govtechmy/myds-react/button'
import { Input } from '@govtechmy/myds-react/input'
import { Spinner } from '@govtechmy/myds-react/spinner'
import { useToast } from '@govtechmy/myds-react/hooks'
import { Eye, EyeOff } from '@/assets/Icons/Eye'
import { changePassword } from '@/services/auth.svc'
import extractBackendError from '@/utils/extractBackendError'
import PasswordRequirementsChecklist from '@/components/shared/PasswordRequirementsChecklist'
import ForcedLogoutDialog from '@/components/shared/ForcedLogoutDialog'
import { isPasswordPolicyMet } from '@/utils/passwordPolicy'

// Delay before the forced-logout modal appears after a successful password change,
// so the user has a moment to read the success toast first.
const LOGOUT_MODAL_DELAY_MS = 2000

interface ChangePasswordFormProps {
  heading?: string
  submitLabel?: string
  hideHeading?: boolean
}

export default function ChangePasswordForm({
  heading = 'Set Semula Kata Laluan',
  submitLabel = 'Kemaskini Kata Laluan',
  hideHeading = false,
}: ChangePasswordFormProps) {
  const { toast } = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const logoutModalDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clear the pending forced-logout timer if the component unmounts before it fires.
  useEffect(() => {
    return () => {
      if (logoutModalDelayRef.current) {
        clearTimeout(logoutModalDelayRef.current)
      }
    }
  }, [])

  const isConfirmMismatch = confirmPassword.trim() !== '' && confirmPassword !== newPassword
  const isFormValid =
    currentPassword.trim() !== '' &&
    isPasswordPolicyMet(newPassword) &&
    confirmPassword.trim() !== '' &&
    newPassword === confirmPassword

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return

    setIsSubmitting(true)
    try {
      const message = await changePassword(currentPassword, newPassword)
      toast({
        variant: 'success',
        title: 'Kata Laluan Berjaya Dikemaskini',
        description: message,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      // Session is invalidated by the backend after a password change — force
      // the user out once they've had a moment to see the success toast.
      logoutModalDelayRef.current = setTimeout(() => {
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
      {!hideHeading && <div className="font-body font-semibold text-body-md">{heading}</div>}
      <div className="flex flex-col gap-6 text-body-md font-medium font-body text-txt-black-700 max-w-[460px]">
        <div className="flex flex-col gap-1.5">
          <div className="flex text-body-md">
            Kata Laluan Semasa <div className="text-txt-danger">*</div>
          </div>
          <div className="relative">
            <Input
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder="Masukkan Kata Laluan Semasa"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="font-normal"
            >
              <button
                type="button"
                aria-label={showCurrentPassword ? 'Sembunyikan kata laluan' : 'Papar kata laluan'}
                onClick={() => setShowCurrentPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-black-400 hover:text-txt-black-700 focus:outline-none"
                tabIndex={0}
              >
                {showCurrentPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </Input>
          </div>
        </div>
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
          <PasswordRequirementsChecklist password={newPassword} />
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
          onClick={handleSubmit}
          className="mt-2"
        >
          {isSubmitting ? (
            <>
              <Spinner className="w-4 h-4 mr-2" />
              Mengemaskini...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>

      <ForcedLogoutDialog open={showLogoutModal} />
    </div>
  )
}
