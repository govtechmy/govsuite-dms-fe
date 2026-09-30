import { useMemo } from 'react'
import { CheckCircleIcon, CrossCircleIcon } from '@govtechmy/myds-react/icon'
import { clx } from '@govtechmy/myds-react/utils'
import { PASSWORD_REQUIREMENTS } from '@/utils/passwordPolicy'

interface PasswordRequirementsChecklistProps {
  password: string
  currentPassword: string
}

export default function PasswordRequirementsChecklist({
  password,
  currentPassword,
}: PasswordRequirementsChecklistProps) {
  const requirementResults = useMemo(
    () =>
      PASSWORD_REQUIREMENTS.map((requirement) => ({
        ...requirement,
        isMet: requirement.test(password, currentPassword),
        isViolated: requirement.isViolated?.(password, currentPassword) ?? false,
      })),
    [password, currentPassword]
  )

  return (
    <ul className="flex flex-col gap-1 pt-1">
      {requirementResults.map((requirement) => (
        <li
          key={requirement.key}
          className={clx(
            'flex items-center gap-2 text-body-sm font-normal',
            requirement.isMet
              ? 'text-txt-success'
              : requirement.isViolated
                ? 'text-txt-danger'
                : 'text-txt-black-500'
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
  )
}
