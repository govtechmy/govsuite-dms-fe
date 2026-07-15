import { useState, useRef, type UIEvent } from 'react'
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
import { Spinner } from '@govtechmy/myds-react/spinner'
import folderClose from '@/assets/png/Folder_close.png'
import { ArrowBackIcon } from '@govtechmy/myds-react/icon'
import { useFolderLocationStore } from '@/store/FolderLocationStore'
import {
  getCatalogBase,
  getCatalogFoldersAndDocuments,
  type CatalogBaseItem,
  type CatalogFolderItem,
  type CatalogListMeta,
} from '@/services/catalog.svc'
import FolderGrid, { type Folder } from '@/components/shared/FolderGrid'
import ProgressResultChecker, { type ProgressState } from '@/components/shared/ProgressResult'
import extractBackendError from '@/utils/extractBackendError'
import convertPathFormat from '@/utils/convertPathFormat'

interface PathNode {
  id: string
  name: string
  path: string
}

interface FolderContentState {
  folders: CatalogFolderItem[]
  folderMeta: CatalogListMeta | null
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
}

interface RequestState {
  page: number
  limit: number
}

const LAZY_BATCH_SIZE = 15

const EMPTY_CONTENT: FolderContentState = {
  folders: [],
  folderMeta: null,
  isLoading: false,
  isLoadingMore: false,
  error: null,
}

const DEFAULT_REQUEST_STATE: RequestState = {
  page: 1,
  limit: LAZY_BATCH_SIZE,
}

interface ModalLokasiFolderProps {
  selectedPath?: string
}

export default function ModalLokasiFolder({ selectedPath = '' }: ModalLokasiFolderProps) {
  const { folderSelection, setFolderSelection } = useFolderLocationStore()
  const [isOpen, setIsOpen] = useState(false)
  const [baseUnits, setBaseUnits] = useState<CatalogBaseItem[]>([])
  const [currentPath, setCurrentPath] = useState<PathNode[]>([])
  const [folderContent, setFolderContent] = useState<FolderContentState>(EMPTY_CONTENT)
  const [requestState, setRequestState] = useState<RequestState>(DEFAULT_REQUEST_STATE)
  const [selectedFolder, setSelectedFolder] = useState<{
    displayPath: string
    matchPath: string
    id: string
  } | null>(null)
  const [loadingFolders, setLoadingFolders] = useState<Record<string, boolean>>({})
  const [progressState, setProgressState] = useState<ProgressState>(null)
  const [errorDetails, setErrorDetails] = useState<{ code: string; message: string } | null>(null)

  const appendRequestInFlightRef = useRef<boolean>(false)
  const latestRequestTokenRef = useRef<number>(0)

  const createRequestToken = () => {
    const nextToken = latestRequestTokenRef.current + 1
    latestRequestTokenRef.current = nextToken
    return nextToken
  }

  const isLatestRequestToken = (requestToken: number) => {
    return latestRequestTokenRef.current === requestToken
  }

  const fetchBaseFolders = async () => {
    setFolderContent({ ...EMPTY_CONTENT, isLoading: true })
    setProgressState('loading')
    setErrorDetails(null)

    try {
      const data = await getCatalogBase()
      setBaseUnits(data)
      setFolderContent({ ...EMPTY_CONTENT })
      setProgressState(null)
      return data
    } catch (error) {
      const backendError = extractBackendError(error)
      setErrorDetails({
        code: backendError?.code ?? 'REQUEST_FAILED',
        message: backendError?.message ?? 'Gagal memuatkan folder. Sila cuba lagi.',
      })
      setProgressState('error')
      setFolderContent({ ...EMPTY_CONTENT, error: 'Failed to load base folders' })
      return []
    }
  }

  const restoreSelectionPath = async (baseUnits: CatalogBaseItem[]) => {
    if (!folderSelection.id || !folderSelection.path) {
      return false
    }

    try {
      const pathSegments = folderSelection.path.split(' > ').map((s) => s.trim())
      if (pathSegments.length === 0) return false

      // Find the base unit (first segment)
      const baseUnit = baseUnits.find((unit) => unit.name === pathSegments[0])
      if (!baseUnit) return false

      const restoredPath: PathNode[] = []
      let currentParentId = baseUnit.id

      // Build path nodes from base to selected folder
      restoredPath.push({
        id: baseUnit.id,
        name: baseUnit.name,
        path: baseUnit.path,
      })

      // Resolve remaining segments
      for (let i = 1; i < pathSegments.length; i++) {
        const segmentName = pathSegments[i]
        const parentData = await getCatalogFoldersAndDocuments(currentParentId, {
          page: 1,
          limit: 100, // Fetch enough to find the segment
        })

        const matchingFolder = parentData.folder.items.find((folder) => folder.name === segmentName)

        if (!matchingFolder) {
          // Segment not found, cannot restore full path
          return false
        }

        restoredPath.push({
          id: matchingFolder.id,
          name: matchingFolder.name,
          path: matchingFolder.fullPath,
        })

        currentParentId = matchingFolder.id
      }

      // Successfully restored path, now set state and fetch final folder content
      setCurrentPath(restoredPath)

      // Set selectedFolder with both displayPath and matchPath
      const lastNode = restoredPath[restoredPath.length - 1]
      setSelectedFolder({
        displayPath: folderSelection.path,
        matchPath: lastNode.path,
        id: folderSelection.id,
      })

      await fetchFolderContent(folderSelection.id, { page: 1 })
      return true
    } catch (error) {
      // Failed to restore, will fallback to base view
      console.error('Failed to restore folder path:', error)
      return false
    }
  }

  const fetchFolderContent = async (
    folderId: string,
    options?: {
      page?: number
      limit?: number
      append?: boolean
    }
  ) => {
    const append = options?.append ?? false
    const nextPage = options?.page ?? (append ? requestState.page + 1 : 1)
    const nextLimit = options?.limit ?? requestState.limit
    const requestToken = createRequestToken()

    if (append) {
      setFolderContent((prev) => ({ ...prev, isLoadingMore: true, error: null }))
    } else {
      setFolderContent({ ...EMPTY_CONTENT, isLoading: true })
      setProgressState('loading')
    }

    setErrorDetails(null)

    try {
      const data = await getCatalogFoldersAndDocuments(folderId, {
        page: nextPage,
        limit: nextLimit,
      })

      if (!isLatestRequestToken(requestToken)) {
        return
      }

      setFolderContent((prev) => ({
        folders: append ? [...prev.folders, ...data.folder.items] : data.folder.items,
        folderMeta: data.folder.meta,
        isLoading: false,
        isLoadingMore: false,
        error: null,
      }))

      setRequestState({
        page: nextPage,
        limit: nextLimit,
      })

      setProgressState(null)
    } catch (error) {
      if (!isLatestRequestToken(requestToken)) {
        return
      }

      const backendError = extractBackendError(error)
      setErrorDetails({
        code: backendError?.code ?? 'REQUEST_FAILED',
        message: backendError?.message ?? 'Gagal memuatkan folder. Sila cuba lagi.',
      })
      setProgressState('error')
      setFolderContent((prev) => ({
        ...prev,
        isLoading: false,
        isLoadingMore: false,
        error: 'Failed to fetch folder content',
      }))
    }
  }

  const handleOpenChange = async (open: boolean) => {
    if (open) {
      setCurrentPath([])
      setSelectedFolder(null)
      setFolderContent(EMPTY_CONTENT)
      setRequestState(DEFAULT_REQUEST_STATE)
      setProgressState(null)
      setErrorDetails(null)

      // Always fetch base folders first
      const baseData = await fetchBaseFolders()

      // Try to restore previous selection if it exists
      if (folderSelection.id && baseData.length > 0) {
        const restored = await restoreSelectionPath(baseData)
        // If restoration failed, modal will show base folders (already loaded)
        if (!restored) {
          setCurrentPath([])
          setFolderContent(EMPTY_CONTENT)
          setSelectedFolder(null)
        }
      }
    } else {
      // Reset on close
      setCurrentPath([])
      setFolderContent(EMPTY_CONTENT)
      setProgressState(null)
      setErrorDetails(null)
    }
    setIsOpen(open)
  }

  const handleBaseFolderSelect = (unit: CatalogBaseItem) => {
    setSelectedFolder({ displayPath: unit.name, matchPath: unit.path, id: unit.id })
  }

  const handleNestedFolderSelect = (folder: Folder) => {
    const selectedFolderItem = folderContent.folders.find((item) => item.fullPath === folder.path)
    if (!selectedFolderItem) return

    const displayPath = convertPathFormat([...currentPath.map((p) => p.name), selectedFolderItem.name])

    setSelectedFolder({
      displayPath,
      matchPath: selectedFolderItem.fullPath,
      id: selectedFolderItem.id,
    })
  }

  const handleBaseFolderClick = async (unit: CatalogBaseItem) => {
    setSelectedFolder({ displayPath: unit.name, matchPath: unit.path, id: unit.id })

    const loadingKey = `base-${unit.path}`
    setLoadingFolders((prev) => ({ ...prev, [loadingKey]: true }))

    try {
      await fetchFolderContent(unit.id, { page: 1 })
      setCurrentPath([
        {
          id: unit.id,
          name: unit.name,
          path: unit.path,
        },
      ])
    } finally {
      setLoadingFolders((prev) => ({ ...prev, [loadingKey]: false }))
    }
  }

  const handleNestedFolderClick = async (folder: Folder) => {
    const selectedFolderItem = folderContent.folders.find((item) => item.fullPath === folder.path)
    if (!selectedFolderItem) return

    const displayPath = convertPathFormat([...currentPath.map((p) => p.name), selectedFolderItem.name])

    setSelectedFolder({
      displayPath,
      matchPath: selectedFolderItem.fullPath,
      id: selectedFolderItem.id,
    })

    const loadingKey = `${currentPath.length > 0 ? currentPath[currentPath.length - 1].id : 'base'}-${folder.path}`
    setLoadingFolders((prev) => ({ ...prev, [loadingKey]: true }))

    try {
      await fetchFolderContent(selectedFolderItem.id, { page: 1 })
      setCurrentPath([
        ...currentPath,
        {
          id: selectedFolderItem.id,
          name: selectedFolderItem.name,
          path: selectedFolderItem.fullPath,
        },
      ])
    } finally {
      setLoadingFolders((prev) => ({ ...prev, [loadingKey]: false }))
    }
  }

  const handleBackClick = async () => {
    if (currentPath.length === 0) return

    const nextPath = currentPath.slice(0, -1)
    setCurrentPath(nextPath)

    if (nextPath.length === 0) {
      // Back to base
      setFolderContent(EMPTY_CONTENT)
      setRequestState(DEFAULT_REQUEST_STATE)
    } else {
      // Back to parent folder
      const targetId = nextPath[nextPath.length - 1].id
      await fetchFolderContent(targetId, { page: 1 })
    }
  }

  const handleBreadcrumbClick = async (index: number) => {
    const nextPath = currentPath.slice(0, index + 1)
    setCurrentPath(nextPath)

    const targetId = nextPath[nextPath.length - 1].id
    await fetchFolderContent(targetId, { page: 1 })
  }

  const handleConfirmFolder = () => {
    if (!selectedFolder) return

    setFolderSelection({ path: selectedFolder.displayPath, id: selectedFolder.id })
    setIsOpen(false)
  }

  const triggerAppendLoad = () => {
    const hasMoreFolders =
      folderContent.folderMeta !== null &&
      folderContent.folders.length < folderContent.folderMeta.totalItems

    if (
      !hasMoreFolders ||
      folderContent.isLoading ||
      folderContent.isLoadingMore ||
      appendRequestInFlightRef.current
    ) {
      return
    }

    appendRequestInFlightRef.current = true
    const targetId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : ''
    void fetchFolderContent(targetId, { append: true }).finally(() => {
      appendRequestInFlightRef.current = false
    })
  }

  const handleLazyLoadScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight

    if (distanceToBottom <= 40) {
      triggerAppendLoad()
    }
  }

  const handleRetry = () => {
    if (currentPath.length === 0) {
      void fetchBaseFolders()
    } else {
      const targetId = currentPath[currentPath.length - 1].id
      void fetchFolderContent(targetId, { page: 1 })
    }
  }

  const displayedFolders: Folder[] =
    currentPath.length === 0
      ? baseUnits.map((unit) => ({
          name: unit.name,
          path: unit.path,
          type: 'folder' as const,
          hasChildren: unit.hasChildren,
          value: unit.value,
        }))
      : folderContent.folders.map((folder) => ({
          name: folder.name,
          path: folder.fullPath,
          type: 'folder' as const,
          hasChildren: folder.hasChildren,
        }))

  const isLoadingContent = currentPath.length === 0 ? false : folderContent.isLoading

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <Button variant="default-outline" size="medium" className="w-full justify-start">
          <div className="text-txt-black-500 font-normal">{selectedPath || 'Lokasi Folder'}</div>
        </Button>
      </DialogTrigger>

      <DialogBody className="w-full max-w-[calc(100dvw-36px)] sm:max-w-2xl lg:max-w-4xl">
        <DialogHeader className="pb-6">
          <DialogTitle>Pilih Lokasi Folder</DialogTitle>
          <DialogDescription className="hidden">content</DialogDescription>
        </DialogHeader>

        <DialogContent className="min-h-[460px] border-y border-otl-gray-200 p-6 flex flex-col">
          {progressState !== null && (
            <div className="flex flex-col w-full flex-1 items-center justify-center">
              <ProgressResultChecker
                progress={progressState}
                loadingDescription="Memuatkan folder. Sila tunggu sebentar."
                successTitle="Berjaya"
                successDescription=""
                successButtonText="Tutup"
                errorTitle="Gagal Memuatkan Folder"
                errorDescription={
                  errorDetails && (
                    <div className="flex flex-col gap-2 items-center justify-center">
                      <div>{errorDetails.message}</div>
                      <div className="text-body-sm text-txt-black-500">{errorDetails.code}</div>
                    </div>
                  )
                }
                errorButtonText="Cuba Lagi"
                onErrorClick={handleRetry}
              />
            </div>
          )}

          {progressState === null && (
            <>
              {/* Breadcrumb Navigation */}
              <div className="mb-6 flex items-center gap-3">
                {currentPath.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBackClick}
                    className="flex size-[18px] shrink-0 items-center justify-center text-txt-black-700 transition-colors hover:text-txt-black-900"
                    aria-label="Go back"
                  >
                    <ArrowBackIcon />
                  </button>
                )}

                {currentPath.length > 0 && (
                  <Breadcrumb>
                    <div className="relative h-[22px] shrink-0 pr-2">
                      <img
                        src={folderClose}
                        alt="Folder"
                        className="h-full w-full object-contain flex-shrink-0"
                      />
                    </div>
                    {currentPath.map((pathItem, index) => (
                      <div key={pathItem.id} className="flex items-center">
                        {index > 0 && <BreadcrumbSeparator />}
                        <BreadcrumbItem>
                          {index === currentPath.length - 1 ? (
                            <BreadcrumbPage className="font-semibold text-[18px] leading-[26px]">
                              {pathItem.name}
                            </BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink
                              onClick={() => handleBreadcrumbClick(index)}
                              className="cursor-pointer font-semibold text-[18px] leading-[26px] hover:text-txt-black-900"
                            >
                              {pathItem.name}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                      </div>
                    ))}
                  </Breadcrumb>
                )}
              </div>

              {/* Folder Grid */}
              <div
                className="h-[360px] overflow-y-auto pr-2"
                onScroll={handleLazyLoadScroll}
                role="region"
                aria-label="Senarai folder"
                tabIndex={0}
              >
                {isLoadingContent ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner size="large" />
                  </div>
                ) : (
                  <FolderGrid
                    folders={displayedFolders}
                    loadingFolders={loadingFolders}
                    unitName={
                      currentPath.length > 0 ? currentPath[currentPath.length - 1].id : 'base'
                    }
                    selectedFolderPath={selectedFolder?.matchPath}
                    onFolderClick={(folder) => {
                      if (currentPath.length === 0) {
                        const unit = baseUnits.find((u) => u.path === folder.path)
                        if (unit) handleBaseFolderSelect(unit)
                      } else {
                        handleNestedFolderSelect(folder)
                      }
                    }}
                    onFolderDoubleClick={(folder) => {
                      if (currentPath.length === 0) {
                        const unit = baseUnits.find((u) => u.path === folder.path)
                        if (unit) void handleBaseFolderClick(unit)
                      } else {
                        void handleNestedFolderClick(folder)
                      }
                    }}
                    emptyMessage="Tiada folder ditemui"
                  />
                )}

                {folderContent.isLoadingMore && (
                  <div className="flex items-center justify-center py-4">
                    <Spinner size="medium" />
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>

        <DialogFooter>
          <DialogClose>
            <Button variant="default-outline">Batalkan</Button>
          </DialogClose>
          <DialogClose>
            <Button variant="primary-fill" onClick={handleConfirmFolder} disabled={!selectedFolder}>
              Pilih Folder
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogBody>
    </Dialog>
  )
}
