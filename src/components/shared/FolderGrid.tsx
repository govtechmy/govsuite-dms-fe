// import BookmarkIcon from '@/assets/Icons/Bookmark'
import folderClose from '@/assets/png/Folder_close.png'
import { Spinner } from '@govtechmy/myds-react/spinner'

export interface Folder {
  name: string
  path: string
  type: 'folder'
  hasChildren: boolean
  value?: number
  children?: Folder[]
}

interface FolderGridProps {
  folders: Folder[]
  loadingFolders: Record<string, boolean>
  unitName: string
  onFolderClick: (folder: Folder) => void
  onFolderDoubleClick?: (folder: Folder) => void
  selectedFolderPath?: string
  emptyMessage?: string
}

export default function FolderGrid({
  folders,
  loadingFolders,
  unitName,
  onFolderClick,
  onFolderDoubleClick,
  selectedFolderPath,
  emptyMessage = 'Tiada folder ditemui',
}: FolderGridProps) {
  if (folders.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <p className="col-span-full py-5 text-center text-body-sm font-medium text-txt-black-500">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {folders.map((folder) => {
        const loadingKey = `${unitName}-${folder.path}`
        const isLoading = loadingFolders[loadingKey]
        const isSelected = selectedFolderPath === folder.path

        return (
          <button
            key={folder.name}
            onClick={() => onFolderClick(folder)}
            onDoubleClick={() => onFolderDoubleClick?.(folder)}
            disabled={isLoading}
            className={`flex flex-col items-center gap-3 rounded-xl p-3 border transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-focus-primary ${
              isSelected
                ? 'border-primary-600 bg-primary-50'
                : 'border-transparent hover:border-otl-gray-300 hover:bg-bg-secondary-50'
            }`}
          >
            <div className="relative flex h-20 items-center justify-center rounded-md p-1.5">
              {isLoading ? (
                <Spinner size="medium" />
              ) : (
                <>
                  <img
                    src={folderClose}
                    alt={`Folder ${folder.name}`}
                    className="h-16 w-[84px] shrink-0 object-contain"
                  />

                  {/* {folder.value !== undefined && (
                    <div className="absolute right-[13px] top-[calc(50%+13px)] flex -translate-y-1/2 items-center justify-center gap-0.5 rounded-md bg-primary-900 px-1.5 py-0.5">
                      <BookmarkIcon className="size-3.5 text-white" />
                      <span className="font-body text-body-sm font-medium leading-6 text-white">
                        {folder.value}
                      </span>
                    </div>
                  )} */}
                </>
              )}
            </div>
            <p className="w-full text-center font-body text-body-md font-medium text-txt-black-900">
              {folder.name}
            </p>
          </button>
        )
      })}
    </div>
  )
}
