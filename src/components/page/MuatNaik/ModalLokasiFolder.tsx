import { useState, useEffect } from 'react'
import { Button } from '@govtechmy/myds-react/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@govtechmy/myds-react/dialog'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@govtechmy/myds-react/breadcrumb'
import BookmarkIcon from '@/assets/Icons/Bookmark'
import folderClose from '@/assets/Icons/Folder_close.png'
import { ArrowBackIcon } from '@govtechmy/myds-react/icon'
import { useFolderLocationStore } from '@/store/FolderLocationStore'

export interface FolderItem {
  name: string
  value: number
  children?: FolderItem[]
}

// Simulated data as if it were fetched from an API
// eslint-disable-next-line react-refresh/only-export-components
export const MOCK_FETCHED_DATA: FolderItem[] = [
  { name: 'JKPPN', value: 20 },
  {
    name: 'KSUKP',
    value: 18,
    children: [
      {
        name: '2026',
        value: 0,
        children: [
          { name: 'January', value: 0 },
          { name: 'February', value: 0 },
          { name: 'March', value: 0 },
          { name: 'April', value: 0 },
          { name: 'May', value: 0 },
          { name: 'June', value: 0 },
          { name: 'July', value: 0 },
          { name: 'August', value: 0 },
          { name: 'September', value: 0 },
          { name: 'October', value: 0 },
          { name: 'November', value: 0 },
          { name: 'December', value: 0 },
        ],
      },
      {
        name: '2025',
        value: 0,
        children: [
          { name: 'January', value: 0 },
          { name: 'February', value: 0 },
          { name: 'March', value: 0 },
          { name: 'April', value: 0 },
          { name: 'May', value: 0 },
          { name: 'June', value: 0 },
          { name: 'July', value: 0 },
          { name: 'August', value: 0 },
          { name: 'September', value: 0 },
          { name: 'October', value: 0 },
          { name: 'November', value: 0 },
          { name: 'December', value: 0 },
        ],
      },
    ],
  },
  { name: 'MJM', value: 3 },
  { name: 'MBKM', value: 15 },
]

interface ModalLokasiFolderProps {
  data?: FolderItem[]
}

export default function ModalLokasiFolder({ data = MOCK_FETCHED_DATA }: ModalLokasiFolderProps) {
  const { folderPath, setFolderPath } = useFolderLocationStore()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState(folderPath)
  const [draftFolder, setDraftFolder] = useState(folderPath)

  // State to track nested navigation
  const [currentPath, setCurrentPath] = useState<FolderItem[]>([])

  // Sync local state with store when folderPath changes
  useEffect(() => {
    setSelectedFolder(folderPath)
    setDraftFolder(folderPath)
  }, [folderPath])

  // Determine which folders to display based on current depth
  const currentFolders =
    currentPath.length === 0 ? data : currentPath[currentPath.length - 1].children || []

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setDraftFolder(selectedFolder)
      setCurrentPath([]) // Reset to root when opening modal
    }
    setIsOpen(open)
  }

  const handleConfirmFolder = () => {
    // Build the full path string from currentPath + selected folder
    let pathString = draftFolder
    if (currentPath.length > 0) {
      const pathNames = currentPath.map((item) => item.name)
      // Only append draftFolder if it's not already the last item in currentPath
      if (draftFolder && currentPath[currentPath.length - 1].name !== draftFolder) {
        pathNames.push(draftFolder)
      }
      pathString = pathNames.join(' > ')
    }
    setSelectedFolder(pathString)
    setFolderPath(pathString) // Update the store
    setIsOpen(false)
  }

  const handleFolderClick = (folder: FolderItem) => {
    setDraftFolder(folder.name)

    // If the folder has children, navigate into it
    if (folder.children && folder.children.length > 0) {
      setCurrentPath([...currentPath, folder])
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <Button variant="default-outline" size="medium" className="w-full justify-start">
          <div className="text-txt-black-500 font-normal">{selectedFolder || 'Lokasi Folder'}</div>
        </Button>
      </DialogTrigger>

      <DialogBody className="w-full max-w-[calc(100dvw-36px)] sm:max-w-2xl lg:max-w-4xl">
        <DialogHeader className="pb-6">
          <DialogTitle>Pilih Lokasi Folder</DialogTitle>
          <DialogDescription className="hidden">content</DialogDescription>
        </DialogHeader>

        <DialogContent className="min-h-[460px] border-y border-otl-gray-200 p-6 flex flex-col">
          {/* Breadcrumb Navigation */}
          <div className="mb-6 flex items-center gap-3">
            {/* Back Button */}
            {currentPath.length > 0 && (
              <button
                type="button"
                onClick={() => setCurrentPath(currentPath.slice(0, -1))}
                className="flex size-[18px] shrink-0 items-center justify-center text-txt-black-700 transition-colors hover:text-txt-black-900"
                aria-label="Go back"
              >
                <ArrowBackIcon />
              </button>
            )}

            {/* Breadcrumb Path */}
            <Breadcrumb>
              {currentPath.length > 0 && (
                <div className="relative h-[22px] shrink-0 pr-2">
                  <img
                    src={folderClose}
                    alt="Folder"
                    className="h-full w-full object-contain flex-shrink-0"
                  />
                </div>
              )}
              {currentPath.map((pathItem, index) => (
                <div key={pathItem.name} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {index === currentPath.length - 1 ? (
                      <BreadcrumbPage className="font-semibold text-[18px] leading-[26px]">
                        {pathItem.name}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
                        className="cursor-pointer font-semibold text-[18px] leading-[26px] hover:text-txt-black-900"
                      >
                        {pathItem.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </Breadcrumb>
          </div>

          {/* Folder Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 content-start overflow-y-auto max-h-[50vh] pr-2">
            {currentFolders.map((folder) => {
              const isSelected = draftFolder === folder.name

              return (
                <button
                  key={folder.name}
                  type="button"
                  className={`rounded-xl border p-3 transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-700 bg-bg-secondary-50 shadow-sm'
                      : 'border-transparent hover:border-otl-gray-300 hover:bg-bg-secondary-50'
                  }`}
                  onClick={() => handleFolderClick(folder)}
                >
                  <div className="flex flex-col items-center gap-3 rounded-xl">
                    <div className="relative flex h-20 items-center justify-center rounded-md p-1.5">
                      <img
                        src={folderClose}
                        alt={`Folder ${folder.name}`}
                        className="h-16 w-[84px] shrink-0 object-contain"
                      />

                      <div className="absolute right-[13px] top-[calc(50%+13px)] flex -translate-y-1/2 items-center justify-center gap-0.5 rounded-md bg-primary-900 px-1.5 py-0.5">
                        <BookmarkIcon className="size-3.5 text-white" />
                        <span className="font-body text-body-sm font-medium leading-6 text-white">
                          {folder.value}
                        </span>
                      </div>
                    </div>

                    <p className="w-full text-center font-body text-body-md font-medium text-txt-black-900">
                      {folder.name}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </DialogContent>

        <DialogFooter>
          <DialogClose>
            <Button variant="default-outline">Batalkan</Button>
          </DialogClose>
          <DialogClose>
            <Button variant="primary-fill" onClick={handleConfirmFolder}>
              Pilih Folder
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogBody>
    </Dialog>
  )
}
