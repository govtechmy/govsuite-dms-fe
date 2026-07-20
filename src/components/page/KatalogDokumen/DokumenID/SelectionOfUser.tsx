import { Button } from '@govtechmy/myds-react/button'
import { Checkbox } from '@govtechmy/myds-react/checkbox'
import { EmailIcon } from '@govtechmy/myds-react/icon'
import { Input } from '@govtechmy/myds-react/input'
import type { AccessibleDocumentUser } from './AccessibleDocumentInfo'

type SelectionOfUserProps = {
  shareDropdownContainerRef: React.RefObject<HTMLDivElement | null>
  selectedShareUsers: string[]
  selectedShareUsersLabel: string
  isShareDropdownOpen: boolean
  filteredUsers: AccessibleDocumentUser[]
  shareDropdownSearchValue: string
  onShareDropdownToggle: () => void
  onToggleSelectedShareUser: (email: string) => void
  onShareDropdownSearchChange: (value: string) => void
  onShareDokumen: () => void
}

export default function SelectionOfUser({
  shareDropdownContainerRef,
  selectedShareUsers,
  selectedShareUsersLabel,
  isShareDropdownOpen,
  filteredUsers,
  shareDropdownSearchValue,
  onShareDropdownToggle,
  onToggleSelectedShareUser,
  onShareDropdownSearchChange,
  onShareDokumen,
}: SelectionOfUserProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-body-md font-medium">Pilih ID Pengguna</div>
      <div className="w-full">
        <div className="flex flex-row gap-1">
          <div ref={shareDropdownContainerRef} className="relative flex-1">
            <Button
              type="button"
              variant="default-outline"
              className="h-10 w-full justify-start gap-2 text-left font-normal"
              onClick={onShareDropdownToggle}
            >
              <EmailIcon className="size-5 shrink-0 text-txt-black-700" />
              <span className="truncate ">
                {selectedShareUsersLabel || (
                  <div className="text-txt-black-500">Pilih ID Untuk Dikongsi</div>
                )}
              </span>
            </Button>

            {isShareDropdownOpen && (
              <div className="absolute z-20 mt-1.5 flex max-h-[400px] w-full flex-col overflow-hidden rounded-md border border-otl-gray-200 bg-bg-white p-1 shadow-sm">
                <div className="min-h-0 flex-1 overflow-y-auto">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((foundUser, index) => {
                      const isChecked = selectedShareUsers.includes(foundUser.email)

                      return (
                        <button
                          key={`${foundUser.email}-${foundUser.username}-${index}`}
                          type="button"
                          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left hover:bg-bg-primary-100"
                          onClick={() => onToggleSelectedShareUser(foundUser.email)}
                        >
                          <div className="flex flex-1 flex-col">
                            <div className="text-body-sm font-medium text-txt-black-700">
                              {foundUser.username}
                            </div>
                            <div className="text-body-xs font-normal text-txt-black-500">
                              {foundUser.email}
                            </div>
                          </div>
                          <Checkbox
                            checked={isChecked}
                            aria-label={`Pilih pengguna ${foundUser.username}`}
                          />
                        </button>
                      )
                    })
                  ) : (
                    <div className="px-2 py-3 text-body-sm text-txt-black-500">
                      Tiada pengguna dijumpai.
                    </div>
                  )}
                </div>
                <div className="border-t border-otl-gray-200 pt-1">
                  <Input
                    className="w-full"
                    placeholder="Cari pengguna"
                    value={shareDropdownSearchValue}
                    onChange={(e) => onShareDropdownSearchChange(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
          <Button type="button" onClick={onShareDokumen}>
            Kongsi
          </Button>
        </div>
      </div>
      {selectedShareUsers.length > 0 && (
        <div className="text-body-xs font-normal text-txt-black-500">
          {selectedShareUsers.length} pengguna dipilih
        </div>
      )}
    </div>
  )
}
