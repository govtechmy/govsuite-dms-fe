import { Button } from '@govtechmy/myds-react/button'
import { CheckCircleIcon, CrossCircleIcon } from '@govtechmy/myds-react/icon'
import { Spinner } from '@govtechmy/myds-react/spinner'
import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface ProgressResultProps {
  icon: ReactNode
  title?: string
  description?: ReactNode
  buttonDisplay?: boolean
  buttonText?: string
  onButtonClick?: () => void
  buttonClassName?: string
  buttonDisplay2?: boolean
  buttonText2?: string
  onButtonClick2?: () => void
  buttonClassName2?: string
}

export type ProgressState = 'loading' | 'success' | 'error' | 'errorUploading' | null

export function ProgressResult(props: ProgressResultProps) {
  return (
    <div className="flex-grow items-center justify-center flex">
      <div className="items-center justify-center flex flex-col gap-3">
        {props.icon}
        {props.title && <div className="text-body-lg font-semibold font-body">{props.title}</div>}
        {props.description && <div className="text-body-sm font-normal">{props.description}</div>}
        {props.buttonDisplay && props.buttonText && (
          <Button
            variant="default-outline"
            size="small"
            className={props.buttonClassName}
            onClick={props.onButtonClick}
          >
            {props.buttonText}
          </Button>
        )}
        {props.buttonDisplay2 && props.buttonText2 && (
          <Button
            variant="default-outline"
            size="small"
            className={props.buttonClassName2}
            onClick={props.onButtonClick2}
          >
            {props.buttonText2}
          </Button>
        )}
      </div>
    </div>
  )
}

interface ProgressResultCheckerProps {
  progress: ProgressState
  navigateSuccess?: string
  navigateSuccess2?: string
  navigateError?: string
  navigateUploadingError?: string
  onSuccessClick?: () => void
  onSuccessClick2?: () => void
  onErrorClick?: () => void
  onUploadingErrorClick?: () => void
  loadingDescription: ReactNode
  successTitle?: string
  successDescription?: ReactNode
  successButtonText?: string
  successButtonClassName?: string
  successButtonText2?: string
  successButtonClassName2?: string
  errorTitle: string
  errorDescription: ReactNode
  errorButtonText: string
  errorUploadingTitle?: string
  errorUploadingDescription?: ReactNode
  errorUploadingButtonText?: string
}

export default function ProgressResultChecker({
  progress,
  loadingDescription,
  successTitle,
  successDescription,
  successButtonText,
  successButtonClassName,
  successButtonText2,
  successButtonClassName2,
  navigateSuccess = '/ms',
  navigateSuccess2 = '/ms',
  onSuccessClick,
  onSuccessClick2,
  errorTitle,
  errorDescription,
  errorButtonText,
  navigateError = '/ms',
  onErrorClick,
  errorUploadingTitle,
  errorUploadingDescription,
  errorUploadingButtonText,
  navigateUploadingError = '/ms',
  onUploadingErrorClick,
}: ProgressResultCheckerProps) {
  const navigate = useNavigate()

  return (
    <>
      {progress === 'loading' && (
        <ProgressResult icon={<Spinner size={'large'} />} description={loadingDescription} />
      )}
      {progress === 'success' && successTitle && successDescription && successButtonText && (
        <ProgressResult
          icon={<CheckCircleIcon className="size-[42px] text-txt-success" />}
          title={successTitle}
          description={successDescription}
          buttonText={successButtonText}
          buttonClassName={successButtonClassName}
          buttonText2={successButtonText2}
          buttonClassName2={successButtonClassName2}
          buttonDisplay={true}
          buttonDisplay2={true}
          onButtonClick={onSuccessClick ?? (() => navigate(`${navigateSuccess}`))}
          onButtonClick2={onSuccessClick2 ?? (() => (window.location.href = `${navigateSuccess2}`))}
        />
      )}
      {progress === 'error' && errorTitle && errorDescription && errorButtonText && (
        <ProgressResult
          icon={<CrossCircleIcon className="size-[42px] text-txt-danger" />}
          title={errorTitle}
          description={errorDescription}
          buttonText={errorButtonText}
          buttonDisplay={true}
          onButtonClick={onErrorClick ?? (() => navigate(`${navigateError}`))}
        />
      )}
      {progress === 'errorUploading' &&
        errorUploadingTitle &&
        errorUploadingDescription &&
        errorUploadingButtonText && (
          <ProgressResult
            icon={<CrossCircleIcon className="size-[42px] text-txt-danger" />}
            title={errorUploadingTitle}
            description={errorUploadingDescription}
            buttonText={errorUploadingButtonText}
            buttonDisplay={true}
            onButtonClick={onUploadingErrorClick ?? (() => navigate(`${navigateUploadingError}`))}
          />
        )}
    </>
  )
}
