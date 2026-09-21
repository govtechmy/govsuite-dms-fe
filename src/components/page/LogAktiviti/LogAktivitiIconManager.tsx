import { FolderOpenIcon } from '@/assets/Icons/FolderOpenIcon'
import { TrendingUpIcon } from '@/assets/Icons/TrendingUpIcon'
import { LOG_ACTION, type LogAction } from '@/services/logAktiviti.svc'
import { Button } from '@govtechmy/myds-react/button'
import {
  ArrowIncomingIcon,
  CalendarIcon,
  CheckCircleIcon,
  CheckShieldIcon,
  ClockIcon,
  CrossCircleIcon,
  DatabaseIcon,
  DocumentAddIcon,
  DocumentFilledIcon,
  DocumentIcon,
  DocumentMinusIcon,
  DownloadIcon,
  EditIcon,
  FolderIcon,
  FolderMinusIcon,
  FolderPlusIcon,
  GovtOfficeIcon,
  GridIcon,
  InfoIcon,
  ListIcon,
  LockFillIcon,
  LockIcon,
  LogoutIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  ReloadIcon,
  SearchIcon,
  SwapIcon,
  TrashIcon,
  UploadIcon,
  UserGroupIcon,
  UserIcon,
  WarningCircleIcon,
  BellIcon,
} from '@govtechmy/myds-react/icon'
import type { ComponentProps, FunctionComponent, ReactNode, SVGProps } from 'react'

interface LogAktivitiIconManagerProps {
  action: LogAction
}

type IconTone = 'success' | 'danger' | 'primary' | 'warning' | 'neutral'

const ICON_BUTTON_VARIANT: Record<IconTone, ComponentProps<typeof Button>['variant']> = {
  success: 'unset',
  danger: 'danger-fill',
  primary: 'primary-fill',
  warning: 'unset',
  neutral: 'default-outline',
}

const ICON_BUTTON_TONE_CLASS: Record<IconTone, string> = {
  success: 'bg-success-600 border border-otl-success-200 text-txt-white',
  danger: 'border border-otl-danger-200 text-txt-white',
  primary: 'border border-otl-primary-200 text-txt-white',
  warning: 'bg-warning-600 border border-otl-warning-200 text-txt-white',
  neutral: '',
}

const renderActionIcon = (
  Icon: FunctionComponent<SVGProps<SVGSVGElement>>,
  tone: IconTone
): ReactNode => (
  <Button
    variant={ICON_BUTTON_VARIANT[tone]}
    className={`size-8 flex items-center justify-center rounded-sm ${ICON_BUTTON_TONE_CLASS[tone]}`.trim()}
  >
    <Icon className="shrink-0 size-4" />
  </Button>
)

const LOG_AKTIVITI_ICON_MAP: Partial<Record<LogAction, ReactNode>> = {
  // Access & security
  [LOG_ACTION.LOGIN_SUCCESS]: renderActionIcon(ArrowIncomingIcon, 'success'),
  [LOG_ACTION.LOGIN_FAILED]: renderActionIcon(CrossCircleIcon, 'danger'),
  [LOG_ACTION.LOGOUT]: renderActionIcon(LogoutIcon, 'danger'),
  [LOG_ACTION.SESSION_TIMEOUT]: renderActionIcon(ClockIcon, 'warning'),
  [LOG_ACTION.CHANGE_PASSWORD]: renderActionIcon(LockIcon, 'primary'),
  [LOG_ACTION.RESET_PASSWORD]: renderActionIcon(LockFillIcon, 'warning'),
  [LOG_ACTION.ACCESS_DOCUMENT_FAILED]: renderActionIcon(WarningCircleIcon, 'danger'),

  // Documents
  [LOG_ACTION.UPLOAD_DOCUMENT]: renderActionIcon(UploadIcon, 'warning'),
  [LOG_ACTION.CREATE_DOCUMENT]: renderActionIcon(DocumentAddIcon, 'success'),
  [LOG_ACTION.ACCESS_DOCUMENT]: renderActionIcon(DocumentFilledIcon, 'success'),
  [LOG_ACTION.UPDATE_DOCUMENT]: renderActionIcon(EditIcon, 'primary'),
  [LOG_ACTION.DOWNLOAD_DOCUMENT]: renderActionIcon(DownloadIcon, 'primary'),
  [LOG_ACTION.DELETE_DOCUMENT]: renderActionIcon(DocumentMinusIcon, 'danger'),
  [LOG_ACTION.ARCHIVE_DOCUMENT]: renderActionIcon(DatabaseIcon, 'warning'),
  [LOG_ACTION.UNARCHIVE_DOCUMENT]: renderActionIcon(ReloadIcon, 'primary'),
  [LOG_ACTION.DISPOSE_DOCUMENT]: renderActionIcon(TrashIcon, 'danger'),

  // Folders
  [LOG_ACTION.READ_FOLDER]: renderActionIcon(FolderOpenIcon, 'success'),
  [LOG_ACTION.ACCESS_FOLDER]: renderActionIcon(FolderIcon, 'success'),
  [LOG_ACTION.CREATE_FOLDER]: renderActionIcon(FolderPlusIcon, 'success'),
  [LOG_ACTION.UPDATE_FOLDER]: renderActionIcon(EditIcon, 'primary'),
  [LOG_ACTION.DELETE_FOLDER]: renderActionIcon(FolderMinusIcon, 'danger'),
  [LOG_ACTION.MOVE_FOLDER]: renderActionIcon(SwapIcon, 'warning'),

  // Records
  [LOG_ACTION.READ_RECORD]: renderActionIcon(ListIcon, 'neutral'),
  [LOG_ACTION.ACCESS_RECORD]: renderActionIcon(DocumentIcon, 'success'),
  [LOG_ACTION.CREATE_RECORD]: renderActionIcon(PlusCircleIcon, 'success'),
  [LOG_ACTION.UPDATE_RECORD]: renderActionIcon(EditIcon, 'primary'),
  [LOG_ACTION.DELETE_RECORD]: renderActionIcon(MinusCircleIcon, 'danger'),
  [LOG_ACTION.MOVE_RECORD]: renderActionIcon(SwapIcon, 'warning'),
  [LOG_ACTION.SEARCH_RECORD]: renderActionIcon(SearchIcon, 'primary'),
  [LOG_ACTION.CREATE_RECORD_PERMISSION]: renderActionIcon(CheckShieldIcon, 'success'),
  [LOG_ACTION.UPDATE_RECORD_PERMISSION]: renderActionIcon(CheckShieldIcon, 'primary'),
  [LOG_ACTION.DELETE_RECORD_PERMISSION]: renderActionIcon(CheckShieldIcon, 'danger'),

  // Users
  [LOG_ACTION.READ_USER]: renderActionIcon(UserGroupIcon, 'neutral'),
  [LOG_ACTION.ACCESS_USER]: renderActionIcon(UserIcon, 'success'),
  [LOG_ACTION.CREATE_USER]: renderActionIcon(UserIcon, 'success'),
  [LOG_ACTION.UPDATE_USER]: renderActionIcon(EditIcon, 'primary'),
  [LOG_ACTION.ACTIVATE_USER]: renderActionIcon(CheckCircleIcon, 'success'),
  [LOG_ACTION.DELETE_USER]: renderActionIcon(UserIcon, 'danger'),

  // Units & roles
  [LOG_ACTION.CREATE_UNIT]: renderActionIcon(GovtOfficeIcon, 'success'),
  [LOG_ACTION.UPDATE_UNIT]: renderActionIcon(GovtOfficeIcon, 'primary'),
  [LOG_ACTION.DELETE_UNIT]: renderActionIcon(GovtOfficeIcon, 'danger'),
  [LOG_ACTION.CREATE_ROLE]: renderActionIcon(UserGroupIcon, 'success'),
  [LOG_ACTION.UPDATE_ROLE]: renderActionIcon(UserGroupIcon, 'primary'),
  [LOG_ACTION.DELETE_ROLE]: renderActionIcon(UserGroupIcon, 'danger'),

  // Dashboard
  [LOG_ACTION.EXECUTIVE_SUMMARY]: renderActionIcon(GridIcon, 'primary'),
  [LOG_ACTION.MEETING_CATEGORY]: renderActionIcon(CalendarIcon, 'primary'),
  [LOG_ACTION.LATEST_ACTIVITIES]: renderActionIcon(BellIcon, 'primary'),
  [LOG_ACTION.PROFILE_TREND]: renderActionIcon(TrendingUpIcon, 'primary'),
}

const DEFAULT_LOG_AKTIVITI_ICON: ReactNode = (
  <Button variant="default-outline" className="size-8 flex items-center justify-center rounded-sm">
    <InfoIcon className="shrink-0 size-4" />
  </Button>
)

export default function LogAktivitiIconManager({ action }: LogAktivitiIconManagerProps) {
  return LOG_AKTIVITI_ICON_MAP[action] ?? DEFAULT_LOG_AKTIVITI_ICON
}
