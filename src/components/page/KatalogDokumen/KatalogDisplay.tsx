import { useRef, useState, type UIEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@govtechmy/myds-react/button'
import { ArrowBackIcon, PlusIcon, UploadIcon } from '@govtechmy/myds-react/icon'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@govtechmy/myds-react/breadcrumb'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@govtechmy/myds-react/accordion'
import { Callout, CalloutContent, CalloutTitle } from '@govtechmy/myds-react/callout'
import { Spinner } from '@govtechmy/myds-react/spinner'
import folderOpen from '@/assets/png/Folder_open.png'
import folderClose from '@/assets/png/Folder_close.png'
import { useFolderLocationStore } from '@/store/FolderLocationStore'
import {
  getCatalogFoldersAndDocuments,
  postCreateFolder,
  type CatalogBaseItem,
  type CatalogFolderItem,
  type CatalogDocumentItem,
  type CatalogListMeta,
} from '@/services/catalog.svc'
import Excerpts from '@/components/shared/Excerpts'
import { clx } from '@govtechmy/myds-react/utils'
import TambahFolderModal from './TambahFolderModal'
import FolderGrid, { type Folder } from '@/components/shared/FolderGrid'

interface KatalogDisplayProps {
  catalogBase: CatalogBaseItem[]
}

interface PathNode {
  id: string
  name: string
  path: string
}

interface UnitContentState {
  folders: CatalogFolderItem[]
  documents: CatalogDocumentItem[]
  folderMeta: CatalogListMeta | null
  recordMeta: CatalogListMeta | null
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
}

interface UnitRequestState {
  page: number
  limit: number
}

const LAZY_BATCH_SIZE = 10

const EMPTY_CONTENT: UnitContentState = {
  folders: [],
  documents: [],
  folderMeta: null,
  recordMeta: null,
  isLoading: false,
  isLoadingMore: false,
  error: null,
}

const DEFAULT_REQUEST_STATE: UnitRequestState = {
  page: 1,
  limit: LAZY_BATCH_SIZE,
}

export default function KatalogDisplay({ catalogBase }: KatalogDisplayProps) {
  const navigate = useNavigate()
  const { lang } = useParams<{ lang: string }>()
  const { setFolderPath } = useFolderLocationStore()

  const [openUnits, setOpenUnits] = useState<string[]>([])
  const [dialogOpenUnit, setDialogOpenUnit] = useState<string | null>(null)
  const [currentPaths, setCurrentPaths] = useState<Record<string, PathNode[]>>({})
  const [unitContent, setUnitContent] = useState<Record<string, UnitContentState>>({})
  const [unitRequestState, setUnitRequestState] = useState<Record<string, UnitRequestState>>({})
  const [loadingFolders, setLoadingFolders] = useState<Record<string, boolean>>({})
  const appendRequestInFlightRef = useRef<Record<string, boolean>>({})
  const latestRequestTokenRef = useRef<Record<string, number>>({})

  const unitsById = catalogBase.reduce<Record<string, CatalogBaseItem>>((acc, unit) => {
    acc[unit.id] = unit
    return acc
  }, {})

  const updateUnitContent = (unitId: string, updates: Partial<UnitContentState>) => {
    setUnitContent((prev) => ({
      ...prev,
      [unitId]: {
        ...(prev[unitId] ?? EMPTY_CONTENT),
        ...updates,
      },
    }))
  }

  const setUnitLoadingState = (unitId: string, isLoading: boolean, error: string | null = null) => {
    updateUnitContent(unitId, { isLoading, isLoadingMore: false, error })
  }

  const getRequestStateKey = (unitId: string, folderId: string) => {
    return `${unitId}:${folderId}`
  }

  const getUnitRequestState = (unitId: string, folderId: string) => {
    return unitRequestState[getRequestStateKey(unitId, folderId)] ?? DEFAULT_REQUEST_STATE
  }

  const getCurrentFolderId = (unitId: string) => {
    const currentPath = currentPaths[unitId] ?? []
    if (currentPath.length === 0) {
      return unitId
    }

    return currentPath[currentPath.length - 1].id
  }

  const createRequestToken = (unitId: string) => {
    const nextToken = (latestRequestTokenRef.current[unitId] ?? 0) + 1
    latestRequestTokenRef.current[unitId] = nextToken
    return nextToken
  }

  const isLatestRequestToken = (unitId: string, requestToken: number) => {
    return latestRequestTokenRef.current[unitId] === requestToken
  }

  const fetchAndSetUnitContent = async (
    unitId: string,
    idFolder: string,
    options?: {
      page?: number
      limit?: number
      append?: boolean
    }
  ) => {
    const requestKey = getRequestStateKey(unitId, idFolder)
    const previousRequest = getUnitRequestState(unitId, idFolder)
    const append = options?.append ?? false
    const nextPage = options?.page ?? (append ? previousRequest.page + 1 : 1)
    const nextLimit = options?.limit ?? previousRequest.limit
    const requestToken = createRequestToken(unitId)

    if (append) {
      updateUnitContent(unitId, { isLoadingMore: true, error: null })
    } else {
      setUnitLoadingState(unitId, true, null)
    }

    try {
      const data = await getCatalogFoldersAndDocuments(idFolder, {
        page: nextPage,
        limit: nextLimit,
      })

      if (!isLatestRequestToken(unitId, requestToken)) {
        return
      }

      setUnitContent((prev) => {
        const current = prev[unitId] ?? EMPTY_CONTENT

        return {
          ...prev,
          [unitId]: {
            ...current,
            folders: append ? [...current.folders, ...data.folder.items] : data.folder.items,
            documents: append ? [...current.documents, ...data.record.items] : data.record.items,
            folderMeta: data.folder.meta,
            recordMeta: data.record.meta,
            isLoading: false,
            isLoadingMore: false,
            error: null,
          },
        }
      })
      setUnitRequestState((prev) => ({
        ...prev,
        [requestKey]: {
          page: nextPage,
          limit: nextLimit,
        },
      }))
    } catch (error) {
      if (!isLatestRequestToken(unitId, requestToken)) {
        return
      }

      const message = error instanceof Error ? error.message : 'Failed to fetch catalog data'
      updateUnitContent(unitId, {
        isLoading: false,
        isLoadingMore: false,
        error: message,
      })
    }
  }

  const handleAccordionChange = (values: string[]) => {
    const newlyOpened = values.filter((value) => !openUnits.includes(value))
    setOpenUnits(values)

    newlyOpened.forEach((unitId) => {
      const hasLoadedBefore = unitContent[unitId] !== undefined
      if (!hasLoadedBefore) {
        void fetchAndSetUnitContent(unitId, unitId)
      }

      setCurrentPaths((prev) => {
        if (prev[unitId] !== undefined) {
          return prev
        }

        return {
          ...prev,
          [unitId]: [],
        }
      })
    })
  }

  const handleFolderClick = async (unitId: string, folder: Folder) => {
    const selectedFolder = (unitContent[unitId]?.folders ?? []).find(
      (item) => item.fullPath === folder.path
    )
    if (!selectedFolder) return

    const loadingKey = `${unitId}-${folder.path}`

    setLoadingFolders((prev) => ({ ...prev, [loadingKey]: true }))

    try {
      await fetchAndSetUnitContent(unitId, selectedFolder.id, { page: 1 })
      setCurrentPaths((prev) => ({
        ...prev,
        [unitId]: [
          ...(prev[unitId] ?? []),
          {
            id: selectedFolder.id,
            name: folder.name,
            path: folder.path,
          },
        ],
      }))
    } finally {
      setLoadingFolders((prev) => ({ ...prev, [loadingKey]: false }))
    }
  }

  const handleBackClick = async (unitId: string) => {
    const unit = unitsById[unitId]
    if (!unit) return

    const currentPath = currentPaths[unitId] ?? []
    if (currentPath.length === 0) return

    const nextPath = currentPath.slice(0, -1)
    setCurrentPaths((prev) => ({
      ...prev,
      [unitId]: nextPath,
    }))

    const targetId = nextPath.length === 0 ? unit.id : nextPath[nextPath.length - 1].id
    await fetchAndSetUnitContent(unitId, targetId, { page: 1 })
  }

  const handleBreadcrumbClick = async (unitId: string, index: number) => {
    const unit = unitsById[unitId]
    if (!unit) return

    const currentPath = currentPaths[unitId] ?? []
    const nextPath = index === -1 ? [] : currentPath.slice(0, index + 1)

    setCurrentPaths((prev) => ({
      ...prev,
      [unitId]: nextPath,
    }))

    const targetId = nextPath.length === 0 ? unit.id : nextPath[nextPath.length - 1].id
    await fetchAndSetUnitContent(unitId, targetId, { page: 1 })
  }

  const handleAddFolder = async (folderName: string): Promise<boolean> => {
    const unitId = dialogOpenUnit
    if (!unitId) return false

    const unit = unitsById[unitId]
    if (!unit) return false

    const currentPath = currentPaths[unitId] ?? []
    const parentId = currentPath.length === 0 ? unit.id : currentPath[currentPath.length - 1].id

    updateUnitContent(unitId, { error: null })

    try {
      const createdFolder = await postCreateFolder({
        name: folderName,
        parentId,
      })

      setUnitContent((prev) => {
        const content = prev[unitId] ?? EMPTY_CONTENT
        return {
          ...prev,
          [unitId]: {
            ...content,
            folders: [...content.folders, createdFolder],
            error: null,
          },
        }
      })

      setDialogOpenUnit(null)
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create folder'
      updateUnitContent(unitId, { error: message })
      return false
    }
  }

  const handleUploadClick = (unitId: string) => {
    const unit = unitsById[unitId]
    if (!unit) return

    const currentPath = currentPaths[unitId] ?? []

    let pathString = unit.name
    if (currentPath.length > 0) {
      const pathNames = currentPath.map((item) => item.name)
      pathString = [unit.name, ...pathNames].join(' > ')
    }

    setFolderPath(pathString)
    navigate(`/${lang}/muatnaik-dokumen`)
  }

  const triggerAppendLoad = (unitId: string, hasMoreItems: boolean) => {
    const unitState = unitContent[unitId] ?? EMPTY_CONTENT
    if (
      !hasMoreItems ||
      unitState.isLoading ||
      unitState.isLoadingMore ||
      appendRequestInFlightRef.current[unitId]
    ) {
      return
    }

    appendRequestInFlightRef.current[unitId] = true
    void fetchAndSetUnitContent(unitId, getCurrentFolderId(unitId), {
      append: true,
    }).finally(() => {
      appendRequestInFlightRef.current[unitId] = false
    })
  }

  const handleLazyLoadScroll = (
    event: UIEvent<HTMLDivElement>,
    unitId: string,
    hasMoreItems: boolean
  ) => {
    const target = event.currentTarget
    const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight

    if (distanceToBottom <= 40) {
      triggerAppendLoad(unitId, hasMoreItems)
    }
  }

  return (
    <Accordion
      type="multiple"
      value={openUnits}
      onValueChange={handleAccordionChange}
      className="space-y-6"
    >
      {catalogBase.map((unit) => {
        const unitState = unitContent[unit.id] ?? EMPTY_CONTENT
        const currentPath = currentPaths[unit.id] ?? []
        const isOpen = openUnits.includes(unit.id)
        const hasMoreFolders =
          unitState.folderMeta !== null &&
          unitState.folders.length < unitState.folderMeta.totalItems
        const hasMoreDocuments =
          unitState.recordMeta !== null &&
          unitState.documents.length < unitState.recordMeta.totalItems
        const hasMoreItems = hasMoreFolders || hasMoreDocuments

        const currentFolders: Folder[] = unitState.folders.map((folder) => ({
          name: folder.name,
          path: folder.fullPath,
          type: 'folder',
          hasChildren: folder.hasChildren,
        }))

        const existingFolderNames = currentFolders.map((folder) => folder.name)

        return (
          <AccordionItem key={unit.id} value={unit.id} className="border-none">
            <div className="flex flex-col gap-1">
              <AccordionTrigger className="py-0 hover:no-underline">
                <div className="flex w-full items-center gap-3 text-left">
                  {currentPath.length > 0 ? (
                    <>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation()
                          void handleBackClick(unit.id)
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            event.stopPropagation()
                            void handleBackClick(unit.id)
                          }
                        }}
                        className="flex size-[18px] shrink-0 items-center justify-center text-txt-black-700 transition-colors hover:text-txt-black-900 cursor-pointer"
                        aria-label="Go back"
                      >
                        <ArrowBackIcon />
                      </div>

                      <Breadcrumb>
                        <div className="relative h-[22px] shrink-0 pr-2">
                          <img
                            src={folderOpen}
                            alt="Folder"
                            className="h-full w-full object-contain flex-shrink-0"
                          />
                        </div>
                        <BreadcrumbItem>
                          <BreadcrumbLink
                            onClick={(event) => {
                              event.stopPropagation()
                              void handleBreadcrumbClick(unit.id, -1)
                            }}
                            className="cursor-pointer font-semibold text-[18px] leading-[26px] hover:text-txt-black-900"
                          >
                            {unit.name}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        {currentPath.map((pathItem, index) => (
                          <div key={pathItem.id} className="flex items-center">
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              {index === currentPath.length - 1 ? (
                                <BreadcrumbPage className="font-semibold text-[18px] leading-[26px]">
                                  {pathItem.name}
                                </BreadcrumbPage>
                              ) : (
                                <BreadcrumbLink
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    void handleBreadcrumbClick(unit.id, index)
                                  }}
                                  className="cursor-pointer font-semibold text-[18px] leading-[26px] hover:text-txt-black-900"
                                >
                                  {pathItem.name}
                                </BreadcrumbLink>
                              )}
                            </BreadcrumbItem>
                          </div>
                        ))}
                      </Breadcrumb>
                    </>
                  ) : (
                    <>
                      <img
                        src={isOpen ? folderOpen : folderClose}
                        alt="Folder"
                        className="h-8 w-8 shrink-0 object-contain transition-all duration-200"
                      />

                      <h2 className="text-body-lg font-semibold text-txt-black-900 whitespace-nowrap">
                        {unit.name}
                      </h2>
                    </>
                  )}

                  <div className="flex-1 border-t border-dashed border-otl-gray-200" />
                </div>
              </AccordionTrigger>

              {isOpen && (
                <div className="flex items-center justify-end gap-1 pt-1">
                  <TambahFolderModal
                    open={dialogOpenUnit === unit.id}
                    onOpenChange={(open) => setDialogOpenUnit(open ? unit.id : null)}
                    onAddFolder={handleAddFolder}
                    existingFolders={existingFolderNames}
                    trigger={
                      <Button
                        variant="default-outline"
                        size="small"
                        onClick={() => setDialogOpenUnit(unit.id)}
                      >
                        <PlusIcon className="size-4" />
                        Tambah Folder
                      </Button>
                    }
                  />

                  <Button
                    variant="primary-fill"
                    size="small"
                    onClick={() => handleUploadClick(unit.id)}
                  >
                    <UploadIcon className="h-4 w-4" />
                    Muat Naik Dokumen
                  </Button>
                </div>
              )}
            </div>

            <AccordionContent className="pb-0 pt-6">
              <div
                className={clx(
                  'flex flex-col',
                  currentFolders.length > 0 && unitState.documents.length > 0 && 'gap-6'
                )}
              >
                {unitState.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner size="large" />
                  </div>
                ) : unitState.error ? (
                  <Callout variant="danger">
                    <CalloutTitle>Ralat</CalloutTitle>
                    <CalloutContent>{unitState.error}</CalloutContent>
                  </Callout>
                ) : (
                  <>
                    <div
                      className="h-[150px] overflow-y-auto pr-1"
                      onScroll={(event) => handleLazyLoadScroll(event, unit.id, hasMoreItems)}
                      role="region"
                      aria-label="Senarai folder"
                      tabIndex={0}
                    >
                      <FolderGrid
                        folders={currentFolders}
                        loadingFolders={loadingFolders}
                        unitName={unit.id}
                        onFolderClick={(folder) => {
                          void handleFolderClick(unit.id, folder)
                        }}
                        emptyMessage={
                          currentFolders.length === 0 ? 'Tiada folder ditemui' : undefined
                        }
                      />
                    </div>

                    {unitState.documents.length > 0 && (
                      <div className="pt-6 border-t border-otl-gray-200">
                        <div
                          className="h-[270px] overflow-y-auto pr-1"
                          role="region"
                          aria-label="Senarai folder"
                          tabIndex={0}
                          onScroll={(event) => handleLazyLoadScroll(event, unit.id, hasMoreItems)}
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {unitState.documents.map((doc) => (
                              <Excerpts
                                key={`${doc.id}`}
                                date={doc.recordDate || ''}
                                secretTag={doc.accessLevel}
                                statusTag={doc.status}
                                title={doc.recordTitle || 'Tiada Tajuk Rekod'}
                                type={doc.documentProfile || 'Tiada Profil'}
                                unit={unit.name || 'Tiada Nama Unit'}
                                onClick={() => navigate(`/${lang}/katalog-dokumen/${doc.recordId}`)}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
