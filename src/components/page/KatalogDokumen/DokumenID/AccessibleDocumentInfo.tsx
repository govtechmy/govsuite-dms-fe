import { Button } from '@govtechmy/myds-react/button'
import { TrashIcon } from '@govtechmy/myds-react/icon'
import getUserInitials from '@/utils/getUserInitials'

export type AccessibleDocumentUser = {
  username: string
  email: string
}

type AccessibleDocumentInfoProps = {
  documentAccessUsers: AccessibleDocumentUser[]
  isShareDropdownOpen: boolean
  onOpenDeleteAccessDialog: (username: string, email: string) => void
}

export default function AccessibleDocumentInfo({
  documentAccessUsers,
  isShareDropdownOpen,
  onOpenDeleteAccessDialog,
}: AccessibleDocumentInfoProps) {
  return (
    <div
      className={`flex flex-col gap-1 transition duration-200 ${isShareDropdownOpen ? 'pointer-events-none select-none blur-[1.5px]' : ''}`}
    >
      <div className="text-body-sm font-normal text-txt-black-500">
        Dokumen ini boleh diakses oleh:
      </div>

      {documentAccessUsers.map((selectedUser) => (
        <div
          key={`${selectedUser.username}-${selectedUser.email}`}
          className="flex items-center gap-1.5 border-b border-otl-gray-200 px-1 py-1"
        >
          <div className="size-9 shrink-0 rounded-full bg-primary-100 flex items-center justify-center">
            <div className="text-txt-primary font-body text-body-sm">
              {getUserInitials(selectedUser.username)}
            </div>
          </div>
          <div className="flex flex-1 min-w-0 flex-col pl-2">
            <div className="text-body-sm font-medium text-txt-black-700">
              {selectedUser.username}
            </div>
            <div className="text-body-xs font-normal text-txt-black-500">{selectedUser.email}</div>
          </div>
          <Button
            aria-label={`Padam pengguna ${selectedUser.username}`}
            variant="danger-outline"
            className="p-2 shrink-0 border-0 shadow-none"
            onClick={() => onOpenDeleteAccessDialog(selectedUser.username, selectedUser.email)}
            style={{ boxShadow: 'none' }}
          >
            <TrashIcon className="size-6 shrink-0" />
          </Button>
        </div>
      ))}
    </div>
  )
}
