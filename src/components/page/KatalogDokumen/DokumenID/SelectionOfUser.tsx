import { Button } from '@govtechmy/myds-react/button'
import { Checkbox } from '@govtechmy/myds-react/checkbox'
import { EmailIcon } from '@govtechmy/myds-react/icon'
import { Input } from '@govtechmy/myds-react/input'
import { Tag } from '@govtechmy/myds-react/tag'
import type { RefObject } from 'react'
import type { ShareUser } from '@/services/shareDocument.svc'

type SelectionOfUserProps = {
  shareDropdownContainerRef: RefObject<HTMLDivElement | null>
  selectedShareUsers: string[]
  selectedShareUsersLabel: string
  isShareDropdownOpen: boolean
  filteredUsers: ShareUser[]
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
              className="h-10 w-full max-w-[774px] justify-start gap-2 text-left font-normal"
              onClick={onShareDropdownToggle}
              aria-label={selectedShareUsersLabel || 'Pilih ID Untuk Dikongsi'}
            >
              <EmailIcon className="size-5 shrink-0 text-txt-black-700" />
              <span className="truncate text-txt-black-500">Pilih ID Untuk Dikongsi</span>
            </Button>

            {isShareDropdownOpen && (
              <div className="absolute z-20 mt-1.5 flex max-h-[300px] w-full flex-col overflow-hidden rounded-md border border-otl-gray-200 bg-bg-white p-1 shadow-sm">
                <div className="border-b border-otl-gray-200 pb-1">
                  <Input
                    className="w-full"
                    placeholder="Cari pengguna"
                    value={shareDropdownSearchValue}
                    onChange={(e) => onShareDropdownSearchChange(e.target.value)}
                  />
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((foundUser, index) => {
                      const isChecked = selectedShareUsers.includes(foundUser.email)

                      return (
                        <div
                          key={`${foundUser.email}-${foundUser.fullName}-${index}`}
                          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left hover:bg-bg-primary-100"
                          onClick={() => onToggleSelectedShareUser(foundUser.email)}
                        >
                          <div className="flex flex-1 flex-col">
                            <div className="text-body-sm font-medium text-txt-black-700">
                              {foundUser.fullName}
                            </div>
                            <div className="text-body-xs font-normal text-txt-black-500">
                              {foundUser.email}
                            </div>
                          </div>
                          <Checkbox
                            checked={isChecked}
                            aria-label={`Pilih pengguna ${foundUser.fullName}`}
                          />
                        </div>
                      )
                    })
                  ) : (
                    <div className="px-2 py-3 text-body-sm text-txt-black-500">
                      Tiada pengguna dijumpai.
                    </div>
                  )}
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
        <div className="flex flex-col gap-2">
          <div className="text-body-xs font-normal text-txt-black-500">
            {selectedShareUsers.length} pengguna dipilih
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedShareUsers.map((email) => (
              <Tag key={email} mode="pill" size="small" variant="default">
                <div className="flex items-center gap-1.5">
                  <span>{email}</span>
                  <button
                    type="button"
                    className="rounded-full px-1 text-body-xs leading-none text-txt-black-700 hover:bg-bg-primary-100"
                    aria-label={`Buang pengguna ${email}`}
                    onClick={() => onToggleSelectedShareUser(email)}
                  >
                    x
                  </button>
                </div>
              </Tag>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
