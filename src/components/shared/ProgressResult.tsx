import { Button } from '@govtechmy/myds-react/button'
import { CheckCircleIcon, CrossCircleIcon } from '@govtechmy/myds-react/icon'
import { Spinner } from '@govtechmy/myds-react/spinner'
import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface ProgressResultProps {
  icon: ReactNode
  title?: string
  description?: string
  buttonDisplay?: boolean
  buttonText?: string
  onButtonClick?: () => void
  buttonDisplay2?: boolean
  buttonText2?: string
  onButtonClick2?: () => void
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
          <Button variant="default-outline" size="small" onClick={props.onButtonClick}>
            {props.buttonText}
          </Button>
        )}
        {props.buttonDisplay2 && props.buttonText2 && (
          <Button variant="default-outline" size="small" onClick={props.onButtonClick2}>
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
  loadingDescription: string
  successTitle?: string
  successDescription?: string
  successButtonText?: string
  successButtonText2?: string
  errorTitle: string
  errorDescription: string
  errorButtonText: string
  errorUploadingTitle?: string
  errorUploadingDescription?: string
  errorUploadingButtonText?: string
}

export default function ProgressResultChecker({
  progress,
  loadingDescription,
  successTitle,
  successDescription,
  successButtonText,
  successButtonText2,
  navigateSuccess = '/ms',
  navigateSuccess2 = '/ms',
  errorTitle,
  errorDescription,
  errorButtonText,
  navigateError = '/ms',
  errorUploadingTitle,
  errorUploadingDescription,
  errorUploadingButtonText,
  navigateUploadingError = '/ms',
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
          buttonText2={successButtonText2}
          buttonDisplay={true}
          buttonDisplay2={true}
          onButtonClick={() => navigate(`${navigateSuccess}`)}
          onButtonClick2={() => (window.location.href = `${navigateSuccess2}`)}
        />
      )}
      {progress === 'error' && errorTitle && errorDescription && errorButtonText && (
        <ProgressResult
          icon={<CrossCircleIcon className="size-[42px] text-txt-danger" />}
          title={errorTitle}
          description={errorDescription}
          buttonText={errorButtonText}
          buttonDisplay={true}
          onButtonClick={() => navigate(`${navigateError}`)}
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
            onButtonClick={() => navigate(`${navigateUploadingError}`)}
          />
        )}
    </>
  )
}
