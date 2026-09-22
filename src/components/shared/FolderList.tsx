import type { UIEvent } from 'react'
import DataTable, { type DataTableColumn } from '@/components/shared/DataTable'
import folderClose from '@/assets/png/Folder_close.png'
import { Spinner } from '@govtechmy/myds-react/spinner'
import { ChevronRightIcon } from '@govtechmy/myds-react/icon'
import { formatDateTimeUpdatedDisplay } from '@/utils/formatDate'
import type { Folder } from './FolderGrid'

interface FolderListProps {
  folders: Folder[]
  loadingFolders: Record<string, boolean>
  unitName: string
  onFolderClick: (folder: Folder) => void
  emptyMessage?: string
  onScroll?: (event: UIEvent<HTMLDivElement>) => void
}

export default function FolderList({
  folders,
  loadingFolders,
  unitName,
  onFolderClick,
  emptyMessage = 'Tiada folder ditemui',
  onScroll,
}: FolderListProps) {
  if (folders.length === 0) {
    return (
      <p className="py-5 text-center text-body-sm font-medium text-txt-black-500">{emptyMessage}</p>
    )
  }

  const columns: DataTableColumn<Folder>[] = [
    {
      header: 'Nama',
      className: 'w-full',
      render: (folder) => {
        const isLoading = loadingFolders[`${unitName}-${folder.path}`]

        return (
          <div className="flex min-w-0 items-center gap-3">
            {isLoading ? (
              <Spinner size="small" />
            ) : (
              <img src={folderClose} alt="" className="h-6 w-8 shrink-0 object-contain" />
            )}
            <span className="truncate text-body-sm font-normal text-txt-black-900">
              {folder.name}
            </span>
          </div>
        )
      },
    },
    {
      header: 'Tarikh Diwujudkan',
      className: 'whitespace-nowrap',
      render: (folder) => (
        <div className="flex items-center justify-between gap-2">
          <span className="text-body-sm text-txt-black-700">
            {formatDateTimeUpdatedDisplay(folder.createdAt) || '-'}
          </span>
          <ChevronRightIcon className="size-3.5 shrink-0 text-txt-black-500" />
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={folders}
      rowKey={(folder) => folder.path}
      onRowClick={(folder) => {
        if (loadingFolders[`${unitName}-${folder.path}`]) return
        onFolderClick(folder)
      }}
      rowClassName="h-14"
      stickyHeader
      scrollContainerClassName="max-h-[588px]"
      onScroll={onScroll}
      ariaLabel="Senarai folder"
    />
  )
}
