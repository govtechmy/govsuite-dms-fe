import {
  DocumentFilledIcon,
  LogoutIcon,
  FolderPlusIcon,
  CrossCircleIcon,
  EditIcon,
  UploadIcon,
  CheckCircleIcon,
  DownloadIcon,
} from '@govtechmy/myds-react/icon'
import AddUserIcon from '@/assets/Icons/AddUserIcon'
import LogInIcon from '@/assets/Icons/LogInIcon'
import RemoveUserIcon from '@/assets/Icons/RemoveUserIcon'
import { Button } from '@govtechmy/myds-react/button'

interface LogAktivitiIconProps {
  jenis: string
}

export default function LogAktivitiIcon({ jenis }: LogAktivitiIconProps) {
  switch (jenis) {
    case 'Buka Dokumen':
      return (
        <Button variant="primary-fill" className="border border-otl-primary-200">
          <DocumentFilledIcon className="h-4 w-4" />
        </Button>
      )

    case 'Tambah Akaun':
      return (
        <Button
          variant="unset"
          className="bg-success-600 border border-otl-success-200 text-txt-white"
        >
          <AddUserIcon />
        </Button>
      )

    case 'Buang Akaun':
      return (
        <Button variant="danger-fill" className="border border-otl-danger-200 text-txt-white">
          <RemoveUserIcon className="w-4 h-4" />
        </Button>
      )

    case 'Log Masuk':
      return (
        <Button
          variant="unset"
          className="bg-success-600 border border-otl-success-200 text-txt-white"
        >
          <LogInIcon className="w-4 h-4" />
        </Button>
      )

    case 'Log Keluar':
      return (
        <Button variant="danger-fill" className="border border-otl-danger-200 text-txt-white">
          <LogoutIcon className="w-4 h-4" />
        </Button>
      )

    case 'Cipta Dokumen':
      return (
        <Button variant="primary-fill" className="border border-otl-primary-200 text-txt-white">
          <FolderPlusIcon className="w-4 h-4" />
        </Button>
      )

    case 'Muat Naik Dokumen':
      return (
        <Button
          variant="unset"
          className="bg-warning-600 border border-otl-warning-200 text-txt-white"
        >
          <UploadIcon className="w-4 h-4" />
        </Button>
      )

    case 'Kemaskini Dokumen':
      return (
        <Button variant="primary-fill" className="border border-otl-primary-200 text-txt-white">
          <EditIcon className="w-4 h-4" />
        </Button>
      )

    case 'Muat Turun Dokumen':
      return (
        <Button variant="primary-fill" className="border border-otl-primary-200 text-txt-white">
          <DownloadIcon className="w-4 h-4" />
        </Button>
      )

    case 'Meluluskan Dokumen':
      return (
        <Button
          variant="unset"
          className="bg-success-600 border border-otl-success-200 text-txt-white"
        >
          <CheckCircleIcon className="w-4 h-4" />
        </Button>
      )

    case 'Tidak Meluluskan Dokumen':
      return (
        <Button variant="danger-fill" className="border border-otl-danger-200 text-txt-white">
          <CrossCircleIcon className="w-4 h-4" />
        </Button>
      )

    default:
      return null
  }
}
