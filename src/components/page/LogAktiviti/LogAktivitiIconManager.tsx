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
  jenis: string
}

const LOG_AKTIVITI_ICON_MAP: Record<string, ReactNode> = {
  'Buka Dokumen': (
    <Button
      variant="primary-fill"
      className="border border-otl-primary-200 size-8 flex items-center justify-center rounded-sm"
    >
      <DocumentFilledIcon className="shrink-0 size-4" />
    </Button>
  ),
  'Tambah Akaun': (
    <Button
      variant="unset"
      className="bg-success-600 border border-otl-success-200 text-txt-white size-8 flex items-center justify-center rounded-sm"
    >
      <UserIcon className="shrink-0 size-4" />
    </Button>
  ),
  'Buang Akaun': (
    <Button
      variant="danger-fill"
      className="border border-otl-danger-200 text-txt-white size-8 flex items-center justify-center rounded-sm"
    >
      <UserIcon className="shrink-0 size-4" />
    </Button>
  ),
  'Log Masuk': (
    <Button
      variant="unset"
      className="bg-success-600 border border-otl-success-200 text-txt-white size-8 flex items-center justify-center rounded-sm"
    >
      <ArrowIncomingIcon className="shrink-0 size-4" />
    </Button>
  ),
  'Log Keluar': (
    <Button
      variant="danger-fill"
      className="border border-otl-danger-200 text-txt-white size-8 flex items-center justify-center rounded-sm"
    >
      <LogoutIcon className="shrink-0 size-4" />
    </Button>
  ),
  'Cipta Dokumen': (
    <Button
      variant="primary-fill"
      className="border border-otl-primary-200 text-txt-white size-8 flex items-center justify-center rounded-sm"
    >
      <FolderPlusIcon className="shrink-0 size-4" />
    </Button>
  ),
  'Muat Naik Dokumen': (
    <Button
      variant="unset"
      className="bg-warning-600 border border-otl-warning-200 text-txt-white size-8 flex items-center justify-center rounded-sm"
    >
      <UploadIcon className="shrink-0 size-4" />
    </Button>
  ),
  'Kemaskini Dokumen': (
    <Button
      variant="primary-fill"
      className="border border-otl-primary-200 text-txt-white size-8 flex items-center justify-center rounded-sm"
    >
      <EditIcon className="shrink-0 size-4" />
    </Button>
  ),
  'Muat Turun Dokumen': (
    <Button
      variant="primary-fill"
      className="border border-otl-primary-200 text-txt-white size-8 flex items-center justify-center rounded-sm"
    >
      <DownloadIcon className="shrink-0 size-4" />
    </Button>
  ),
  'Meluluskan Dokumen': (
    <Button
      variant="unset"
      className="bg-success-600 border border-otl-success-200 text-txt-white size-8 flex items-center justify-center rounded-sm"
    >
      <CheckCircleIcon className="shrink-0 size-4" />
    </Button>
  ),
  'Tidak Meluluskan Dokumen': (
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

export default function LogAktivitiIconManager({ jenis }: LogAktivitiIconManagerProps) {
  return LOG_AKTIVITI_ICON_MAP[jenis] ?? DEFAULT_LOG_AKTIVITI_ICON
}
