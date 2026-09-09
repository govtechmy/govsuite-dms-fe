import { SystemAction } from '@/services/logAktiviti.svc'
import { Button } from '@govtechmy/myds-react/button'
import {
  ArrowIncomingIcon,
  CheckCircleIcon,
  CrossCircleIcon,
  DocumentFilledIcon,
  DownloadIcon,
  EditIcon,
  FolderPlusIcon,
  InfoIcon,
  LogoutIcon,
  UploadIcon,
  UserIcon,
} from '@govtechmy/myds-react/icon'
import type { ReactNode } from 'react'

interface LogAktivitiIconManagerProps {
  action: SystemAction
}

const LOG_AKTIVITI_ICON_MAP: Partial<Record<SystemAction, ReactNode>> = {
  [SystemAction.ACCESS_DOCUMENT]: (
    <Button
      variant="primary-fill"
      className="border border-otl-primary-200 size-8 flex items-center justify-center rounded-sm"
    >
      <DocumentFilledIcon className="shrink-0 size-4" />
    </Button>
  ),
  [SystemAction.CREATE_USER]: (
    <Button
      variant="unset"
      className="bg-success-600 border border-otl-success-200 text-txt-white size-8 flex items-center justify-center rounded-sm"
    >
      <UserIcon className="shrink-0 size-4" />
    </Button>
  ),
  [SystemAction.DELETE_USER]: (
    <Button
      variant="danger-fill"
      className="border border-otl-danger-200 text-txt-white size-8 flex items-center justify-center rounded-sm"
    >
      <UserIcon className="shrink-0 size-4" />
    </Button>
  ),
  [SystemAction.LOG_IN]: (
    <Button
      variant="unset"
      className="bg-success-600 border border-otl-success-200 text-txt-white size-8 flex items-center justify-center rounded-sm"
    >
      <ArrowIncomingIcon className="shrink-0 size-4" />
    </Button>
  ),
  [SystemAction.LOG_OUT]: (
    <Button
      variant="danger-fill"
      className="border border-otl-danger-200 text-txt-white size-8 flex items-center justify-center rounded-sm"
    >
      <LogoutIcon className="shrink-0 size-4" />
    </Button>
  ),
  [SystemAction.CREATE_DOCUMENT]: (
    <Button
      variant="primary-fill"
      className="border border-otl-primary-200 text-txt-white size-8 flex items-center justify-center rounded-sm"
    >
      <FolderPlusIcon className="shrink-0 size-4" />
    </Button>
  ),
  [SystemAction.UPLOAD_DOCUMENT]: (
    <Button
      variant="unset"
      className="bg-warning-600 border border-otl-warning-200 text-txt-white size-8 flex items-center justify-center rounded-sm"
    >
      <UploadIcon className="shrink-0 size-4" />
    </Button>
  ),
  [SystemAction.UPDATE_DOCUMENT]: (
    <Button
      variant="primary-fill"
      className="border border-otl-primary-200 text-txt-white size-8 flex items-center justify-center rounded-sm"
    >
      <EditIcon className="shrink-0 size-4" />
    </Button>
  ),
  [SystemAction.DOWNLOAD_DOCUMENT]: (
    <Button
      variant="primary-fill"
      className="border border-otl-primary-200 text-txt-white size-8 flex items-center justify-center rounded-sm"
    >
      <DownloadIcon className="shrink-0 size-4" />
    </Button>
  ),
  [SystemAction.APPROVE_DOCUMENT]: (
    <Button
      variant="unset"
      className="bg-success-600 border border-otl-success-200 text-txt-white size-8 flex items-center justify-center rounded-sm"
    >
      <CheckCircleIcon className="shrink-0 size-4" />
    </Button>
  ),
  [SystemAction.DISAPPROVE_DOCUMENT]: (
    <Button
      variant="danger-fill"
      className="border border-otl-danger-200 text-txt-white size-8 flex items-center justify-center rounded-sm"
    >
      <CrossCircleIcon className="shrink-0 size-4" />
    </Button>
  ),
}

const DEFAULT_LOG_AKTIVITI_ICON: ReactNode = (
  <Button variant="default-outline" className="size-8 flex items-center justify-center rounded-sm">
    <InfoIcon className="shrink-0 size-4" />
  </Button>
)

export default function LogAktivitiIconManager({ action }: LogAktivitiIconManagerProps) {
  return LOG_AKTIVITI_ICON_MAP[action] ?? DEFAULT_LOG_AKTIVITI_ICON
}
