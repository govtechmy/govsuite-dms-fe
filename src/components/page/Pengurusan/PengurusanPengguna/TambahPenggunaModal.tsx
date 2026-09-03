import { useEffect, useState } from 'react'
import { z } from 'zod'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@govtechmy/myds-react/dialog'
import { Button } from '@govtechmy/myds-react/button'
import { Input, InputIcon } from '@govtechmy/myds-react/input'
import { Checkbox } from '@govtechmy/myds-react/checkbox'
import { Spinner } from '@govtechmy/myds-react/spinner'
import { clx } from '@govtechmy/myds-react/utils'
import {
  CheckCircleIcon,
  CrossCircleIcon,
  EditIcon,
  PlusIcon,
  TrashIcon,
  WarningIcon,
} from '@govtechmy/myds-react/icon'
import SelectDropdownUnit from '@/components/page/MuatNaik/SelectDropdownUnit'
import type { DropdownUnit, DropdownUserRole } from '@/services/dropdown.svc'
import {
  checkEmailAvailability,
  createPengguna,
  deletePengguna,
  updatePengguna,
  type PenggunaItem,
} from '@/services/pengurusanPengguna.svc'
import { ROLE_DESCRIPTIONS, type UserRole } from '@/models/userRoles'
import extractBackendError from '@/utils/extractBackendError'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

type ModalPhase = 'form' | 'confirmDelete' | 'loading' | 'success' | 'error'
type ModalMode = 'create' | 'edit'

interface TambahPenggunaModalProps {
  dropdownUnits: DropdownUnit[]
  dropdownTahapAkses: DropdownUserRole[]
  mode?: ModalMode
  pengguna?: PenggunaItem | null
  onSuccess?: () => void
}

interface PenggunaFormState {
  fullName: string
  email: string
  unitId: string
  roles: string[]
}

interface PenggunaErrorState {
  code: string
  message: string
}

type EmailCheckStatus = 'idle' | 'invalid' | 'checking' | 'available' | 'taken' | 'error'

// Delay before the email-availability check fires after the user stops typing.
const EMAIL_CHECK_DEBOUNCE_MS = 500
const emailFormatSchema = z.string().trim().email()

// HQ is excluded from the /units dropdown for security reasons, so a pengguna whose unit
// is HQ can't have their unit re-selected from the list — lock the field and show HQ as-is.
const HQ_UNIT_CODE = 'HQ'

const buildFormState = (pengguna?: PenggunaItem | null): PenggunaFormState => ({
  fullName: pengguna?.fullName ?? '',
  email: pengguna?.email ?? '',
  unitId: pengguna?.unitId ?? '',
  roles: pengguna?.roles ?? [],
})

export default function TambahPenggunaModal({
  dropdownUnits,
  dropdownTahapAkses,
  mode = 'create',
  pengguna = null,
  onSuccess,
}: TambahPenggunaModalProps) {
  const isEditMode = mode === 'edit'
  const isHqUnit = isEditMode && pengguna?.unitId === HQ_UNIT_CODE
  const unitOptions =
    isHqUnit && !dropdownUnits.some((unit) => unit.code === HQ_UNIT_CODE)
      ? [...dropdownUnits, { code: HQ_UNIT_CODE, codeName: HQ_UNIT_CODE }]
      : dropdownUnits

  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<ModalPhase>('form')
  const [error, setError] = useState<PenggunaErrorState | null>(null)
  const [form, setForm] = useState<PenggunaFormState>(() => buildFormState(pengguna))
  const [isDeleteFlow, setIsDeleteFlow] = useState(false)
  const [emailCheckStatus, setEmailCheckStatus] = useState<EmailCheckStatus>('idle')
  const [emailCheckMessage, setEmailCheckMessage] = useState<string | null>(null)

  const initialEmail = pengguna?.email ?? ''
  const debouncedEmail = useDebouncedValue(form.email.trim(), EMAIL_CHECK_DEBOUNCE_MS)

  useEffect(() => {
    if (!open) return

    if (!debouncedEmail || (isEditMode && debouncedEmail === initialEmail)) {
      setEmailCheckStatus('idle')
      setEmailCheckMessage(null)
      return
    }

    if (!emailFormatSchema.safeParse(debouncedEmail).success) {
      setEmailCheckStatus('invalid')
      setEmailCheckMessage(null)
      return
    }

    let cancelled = false
    setEmailCheckStatus('checking')
    setEmailCheckMessage(null)

    checkEmailAvailability(debouncedEmail)
      .then((result) => {
        if (cancelled) return
        setEmailCheckStatus('available')
        setEmailCheckMessage(result.message)
      })
      .catch((err) => {
        if (cancelled) return
        const backendError = extractBackendError(err)
        if (backendError?.code === 'CONFLICT') {
          setEmailCheckStatus('taken')
          setEmailCheckMessage(backendError.message)
        } else {
          setEmailCheckStatus('error')
          setEmailCheckMessage(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [debouncedEmail, open, isEditMode, initialEmail])

  const isFormValid =
    form.fullName.trim() !== '' &&
    form.email.trim() !== '' &&
    form.unitId !== '' &&
    form.roles.length > 0 &&
    emailCheckStatus !== 'checking' &&
    emailCheckStatus !== 'taken' &&
    emailCheckStatus !== 'invalid'

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && phase === 'loading') {
      // Prevent dismissing the modal while the create/update request is in flight
      return
    }
    setOpen(nextOpen)
    if (nextOpen) {
      setForm(buildFormState(pengguna))
      setPhase('form')
      setError(null)
      setIsDeleteFlow(false)
      setEmailCheckStatus('idle')
      setEmailCheckMessage(null)
    } else {
      setPhase('form')
      setError(null)
      setIsDeleteFlow(false)
      setForm(buildFormState(pengguna))
      setEmailCheckStatus('idle')
      setEmailCheckMessage(null)
    }
  }

  const toggleRole = (roleCode: string) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleCode)
        ? prev.roles.filter((code) => code !== roleCode)
        : [...prev.roles, roleCode],
    }))
  }

  const handleSubmitClick = async () => {
    if (!isFormValid) return

    setPhase('loading')
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        unitId: form.unitId,
        roles: form.roles,
        // userAccessLevel: HARDCODED_USER_ACCESS_LEVEL,
      }

      if (isEditMode && pengguna) {
        await updatePengguna(pengguna.id, payload)
      } else {
        await createPengguna(payload)
      }
      setPhase('success')
      onSuccess?.()
    } catch (err) {
      const fallbackMessage = isEditMode
        ? 'Pengguna gagal dikemaskini.'
        : 'Pengguna gagal ditambah.'
      const backendError = extractBackendError(err)
      setError({
        code: backendError?.code ?? 'REQUEST_FAILED',
        message: backendError?.message ?? fallbackMessage,
      })
      setPhase('error')
    }
  }

  const handleCubaLagiClick = () => {
    setError(null)
    setPhase(isDeleteFlow ? 'confirmDelete' : 'form')
  }

  const handleTutupClick = () => {
    setOpen(false)
    setPhase('form')
    setError(null)
    setIsDeleteFlow(false)
    setForm(buildFormState(pengguna))
    setEmailCheckStatus('idle')
    setEmailCheckMessage(null)
  }

  const handleBuangClick = () => {
    setIsDeleteFlow(true)
    setPhase('confirmDelete')
  }

  const handleBatalkanBuangClick = () => {
    setIsDeleteFlow(false)
    setPhase('form')
  }

  const handleConfirmDeleteClick = async () => {
    if (!pengguna) return

    setPhase('loading')
    try {
      await deletePengguna(pengguna.id)
      setPhase('success')
      onSuccess?.()
    } catch (err) {
      const backendError = extractBackendError(err)
      setError({
        code: backendError?.code ?? 'REQUEST_FAILED',
        message: backendError?.message ?? 'Pengguna gagal dibuang.',
      })
      setPhase('error')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        {isEditMode ? (
          <Button variant="default-outline" size="small">
            <EditIcon />
            Edit
          </Button>
        ) : (
          <Button>
            <PlusIcon /> Tambah Pengguna
          </Button>
        )}
      </DialogTrigger>
      <DialogBody
        hideClose={phase === 'loading'}
        className="w-full md:min-w-[700px] [&>button]:p-2 [&>button_svg]:size-4"
      >
        <DialogDescription className="hidden">Dialog content goes here.</DialogDescription>

        {phase === 'form' && (
          <>
            <DialogHeader className="pb-4.5">
              <DialogTitle>{isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna'}</DialogTitle>
            </DialogHeader>
            <DialogContent className="flex flex-col gap-4 border-y border-otl-gray-200 p-6">
              <div className="flex flex-col gap-1.5">
                <div className="text-body-sm font-medium text-txt-black-700">Nama Penuh</div>
                <Input
                  placeholder="Masukkan nama penuh"
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="text-body-sm font-medium text-txt-black-700">
                  Email (ID Pengguna)
                </div>
                <Input
                  type="email"
                  placeholder="Masukkan alamat email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className={clx(
                    emailCheckStatus === 'available' && 'border-otl-success-300',
                    (emailCheckStatus === 'taken' || emailCheckStatus === 'invalid') &&
                      'border-otl-danger-300'
                  )}
                >
                  {emailCheckStatus === 'checking' && (
                    <InputIcon position="right">
                      <Spinner size="small" />
                    </InputIcon>
                  )}
                  {emailCheckStatus === 'available' && (
                    <InputIcon position="right">
                      <CheckCircleIcon className="text-txt-success" />
                    </InputIcon>
                  )}
                  {(emailCheckStatus === 'taken' || emailCheckStatus === 'invalid') && (
                    <InputIcon position="right">
                      <CrossCircleIcon className="text-txt-danger" />
                    </InputIcon>
                  )}
                </Input>
                {emailCheckStatus === 'invalid' && (
                  <span className="text-body-xs font-normal text-txt-danger">
                    Format email tidak sah.
                  </span>
                )}
                {emailCheckStatus === 'checking' && (
                  <span className="text-body-xs font-normal text-txt-black-500">
                    Menyemak ketersediaan email...
                  </span>
                )}
                {emailCheckStatus === 'available' && (
                  <span className="text-body-xs font-normal text-txt-success">
                    Email tersedia untuk digunakan.
                  </span>
                )}
                {emailCheckStatus === 'taken' && (
                  <span className="text-body-xs font-normal text-txt-danger">
                    {emailCheckMessage ?? 'Email telah digunakan oleh pengguna lain.'}
                  </span>
                )}
                {emailCheckStatus === 'error' && (
                  <span className="text-body-xs font-normal text-txt-black-500">
                    Tidak dapat menyemak ketersediaan email buat masa ini.
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="text-body-sm font-medium text-txt-black-700">Unit</div>
                <SelectDropdownUnit
                  dropdownUnits={unitOptions}
                  selectedUnit={form.unitId}
                  onUnitChange={(unitId) => setForm((prev) => ({ ...prev, unitId }))}
                  size="small"
                  disabled={isHqUnit}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-body-sm font-medium text-txt-black-700">Peranan Pengguna</div>
                <div className="flex flex-col gap-3">
                  {dropdownTahapAkses
                    .filter((role) => role.code !== 'SUPER_ADMIN')
                    .map((role) => (
                      <div
                        key={role.code}
                        onClick={() => toggleRole(role.code)}
                        className="flex cursor-pointer items-start gap-2"
                      >
                        <Checkbox
                          checked={form.roles.includes(role.code)}
                          aria-label={role.name}
                          className="mt-0.5 shrink-0"
                        />
                        <div className="flex flex-col gap-1">
                          <span className="text-body-sm font-medium text-txt-black-700">
                            {role.name}
                          </span>
                          {ROLE_DESCRIPTIONS[role.code as UserRole] && (
                            <span className="text-body-xs font-normal text-txt-black-500">
                              {ROLE_DESCRIPTIONS[role.code as UserRole]}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </DialogContent>
            <DialogFooter
              action={
                isEditMode ? (
                  <Button size="medium" variant="danger-outline" onClick={handleBuangClick}>
                    <TrashIcon />
                    Buang Pengguna
                  </Button>
                ) : undefined
              }
            >
              <DialogClose>
                <Button variant="default-outline" size="medium">
                  Batal
                </Button>
              </DialogClose>
              <Button
                variant="primary-fill"
                size="medium"
                disabled={!isFormValid}
                onClick={() => {
                  void handleSubmitClick()
                }}
              >
                {isEditMode ? 'Kemaskini' : 'Tambah'}
              </Button>
            </DialogFooter>
          </>
        )}

        {phase === 'confirmDelete' && (
          <DialogContent className="flex flex-col items-center py-12 text-center">
            <WarningIcon className="text-txt-danger size-[42px]" />
            <DialogTitle className="pt-[16px]">Buang Pengguna?</DialogTitle>
            <DialogDescription>
              Adakah anda pasti untuk membuang {form.fullName || 'pengguna ini'} daripada sistem?
              Tindakan ini tidak boleh dibatalkan.
            </DialogDescription>
            <div className="mt-6 flex w-full gap-2">
              <Button
                size={'large'}
                variant="default-outline"
                className="w-full items-center justify-center"
                onClick={handleBatalkanBuangClick}
              >
                Batalkan
              </Button>
              <Button
                size={'large'}
                variant="danger-fill"
                className="w-full items-center justify-center"
                onClick={() => {
                  void handleConfirmDeleteClick()
                }}
              >
                Buang
              </Button>
            </div>
          </DialogContent>
        )}

        {phase === 'loading' && (
          <DialogContent className="flex flex-col items-center justify-center gap-3 py-12">
            <Spinner size={'large'} />
            <div className="text-body-sm font-normal text-txt-black-700">
              {isDeleteFlow
                ? 'Pengguna Sedang Dibuang'
                : isEditMode
                  ? 'Pengguna Sedang Dikemaskini'
                  : 'Pengguna Sedang Ditambah'}
            </div>
          </DialogContent>
        )}

        {phase === 'success' && (
          <DialogContent className="flex flex-col items-center py-12 text-center">
            <CheckCircleIcon className="text-txt-success size-[42px]" />
            <DialogTitle className="pt-[16px]">
              {isDeleteFlow
                ? 'Pengguna Berjaya Dibuang'
                : isEditMode
                  ? 'Pengguna Berjaya Dikemaskini'
                  : 'Pengguna Berjaya Ditambah'}
            </DialogTitle>
            <DialogDescription>
              {isDeleteFlow
                ? `${form.fullName || 'Pengguna'} telah berjaya dibuang daripada sistem.`
                : isEditMode
                  ? `${form.fullName || 'Pengguna'} telah berjaya dikemaskini.`
                  : `${form.fullName || 'Pengguna baharu'} telah berjaya didaftarkan ke dalam sistem.`}
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
          <DialogContent className="flex flex-col items-center py-12 text-center">
            <WarningIcon className="text-txt-danger size-[42px]" />
            <DialogTitle className="pt-[16px]">
              {isDeleteFlow
                ? 'Gagal Membuang Pengguna'
                : isEditMode
                  ? 'Gagal Mengemaskini Pengguna'
                  : 'Gagal Menambah Pengguna'}
            </DialogTitle>
            <DialogDescription>
              {error?.code ?? 'REQUEST_FAILED'} :{' '}
              {error?.message ??
                (isDeleteFlow
                  ? 'Pengguna gagal dibuang. Sila cuba lagi.'
                  : isEditMode
                    ? 'Pengguna gagal dikemaskini. Sila cuba lagi.'
                    : 'Pengguna gagal ditambah. Sila cuba lagi.')}
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
