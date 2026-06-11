import { useState } from 'react'
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
import BookmarkIcon from '@/assets/Icons/Bookmark'
import folderOpen from '@/assets/Icons/Folder_open.png'
import folderClose from '@/assets/Icons/Folder_close.png'
import { useFolderLocationStore } from '@/store/FolderLocationStore'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@govtechmy/myds-react/dialog'
import { Input } from '@govtechmy/myds-react/input'
import { Callout, CalloutContent, CalloutTitle } from '@govtechmy/myds-react/callout'
import { Spinner } from '@govtechmy/myds-react/spinner'
import { clx } from '@govtechmy/myds-react/utils'

export interface KatalogUnitItem {
  name: string
  value: number
  children?: KatalogUnitItem[]
}

export interface Unit {
  name: string
  items: KatalogUnitItem[]
}

interface KatalogUnitProps {
  units: Unit[]
}

export default function KatalogDisplay({ units: initialUnits }: KatalogUnitProps) {
  const navigate = useNavigate()
  const { lang } = useParams<{ lang: string }>()
  const { setFolderPath } = useFolderLocationStore()
  const [units, setUnits] = useState<Unit[]>(initialUnits)
  const [openUnits, setOpenUnits] = useState<string[]>([])
  const [currentPaths, setCurrentPaths] = useState<Record<string, KatalogUnitItem[]>>({})
  const [folderName, setFolderName] = useState<string>('')
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [showError, setShowError] = useState<boolean>(false)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const handleFolderClick = (unitName: string, folder: KatalogUnitItem) => {
    if (folder.children && folder.children.length > 0) {
      setCurrentPaths((prev) => ({
        ...prev,
        [unitName]: [...(prev[unitName] || []), folder],
      }))
    }
  }

  const handleBackClick = (unitName: string) => {
    setCurrentPaths((prev) => ({
      ...prev,
      [unitName]: (prev[unitName] || []).slice(0, -1),
    }))
  }

  const handleBreadcrumbClick = (unitName: string, index: number) => {
    setCurrentPaths((prev) => ({
      ...prev,
      [unitName]: (prev[unitName] || []).slice(0, index + 1),
    }))
  }

  const handleAccordionChange = (values: string[]) => {
    const previouslyOpen = new Set(openUnits)
    const nowOpen = new Set(values)

    // Find units that were just closed
    for (const unitName of previouslyOpen) {
      if (!nowOpen.has(unitName)) {
        // Reset path when closing
        setCurrentPaths((prev) => ({
          ...prev,
          [unitName]: [],
        }))
      }
    }

    setOpenUnits(values)
  }

  const handleAddFolder = (unitName: string) => {
    const trimmedName = folderName.trim()
    if (!trimmedName) return

    const currentPath = currentPaths[unitName] || []

    // Get current folders at this level
    const targetFolders =
      currentPath.length === 0
        ? units.find((u) => u.name === unitName)?.items || []
        : currentPath[currentPath.length - 1].children || []

    // Check if folder name already exists
    const folderExists = targetFolders.some(
      (folder) => folder.name.toLowerCase() === trimmedName.toLowerCase()
    )

    if (folderExists) {
      setShowError(true)
      return
    }

    // Show loading state
    setIsCreating(true)
    setShowError(false)

    // Simulate folder creation delay
    setTimeout(() => {
      const newFolder: KatalogUnitItem = {
        name: trimmedName,
        value: 0,
        children: [],
      }

      setUnits((prevUnits) => {
        return prevUnits.map((unit) => {
          if (unit.name !== unitName) return unit

          if (currentPath.length === 0) {
            // Add to root level
            return {
              ...unit,
              items: [...unit.items, newFolder],
            }
          } else {
            // Add to nested folder
            const updateItems = (
              items: KatalogUnitItem[],
              pathIndex: number
            ): KatalogUnitItem[] => {
              return items.map((item) => {
                if (item.name === currentPath[pathIndex].name) {
                  if (pathIndex === currentPath.length - 1) {
                    // This is the target folder
                    return {
                      ...item,
                      children: [...(item.children || []), newFolder],
                    }
                  } else {
                    // Need to go deeper
                    return {
                      ...item,
                      children: updateItems(item.children || [], pathIndex + 1),
                    }
                  }
                }
                return item
              })
            }

            return {
              ...unit,
              items: updateItems(unit.items, 0),
            }
          }
        })
      })

      // Reset dialog state
      setIsCreating(false)
      setFolderName('')
      setShowError(false)
      setDialogOpen(false)
    }, 1000) // Simulate API call delay
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      // Reset state when dialog closes
      setFolderName('')
      setShowError(false)
      setIsCreating(false)
    }
  }

  const handleUploadClick = (unitName: string) => {
    const currentPath = currentPaths[unitName] || []

    // Build the folder path string
    let pathString = unitName
    if (currentPath.length > 0) {
      const pathNames = currentPath.map((item) => item.name)
      pathString = [unitName, ...pathNames].join(' > ')
    }

    // Set the folder path in the store
    setFolderPath(pathString)

    // Navigate to the upload page
    navigate(`/${lang}/muatnaik-dokumen`)
  }

  return (
    <Accordion
      type="multiple"
      value={openUnits}
      onValueChange={handleAccordionChange}
      className="space-y-6"
    >
      {units.map((unit) => {
        const isOpen = openUnits.includes(unit.name)
        const currentPath = currentPaths[unit.name] || []
        const currentFolders =
          currentPath.length === 0 ? unit.items : currentPath[currentPath.length - 1].children || []

        return (
          <AccordionItem key={unit.name} value={unit.name} className="border-none">
            <div className="flex flex-col gap-1">
              {/* Title Row */}
              <AccordionTrigger className="py-0 hover:no-underline">
                <div className="flex w-full items-center gap-3 text-left">
                  <img
                    src={isOpen ? folderOpen : folderClose}
                    alt="Folder"
                    className="h-8 w-8 shrink-0 object-contain transition-all duration-200"
                  />

                  <h2 className="text-body-lg font-semibold text-txt-black-900 whitespace-nowrap">
                    {unit.name}
                  </h2>

                  <div className="flex-1 border-t border-dashed border-otl-gray-200" />
                </div>
              </AccordionTrigger>

              {/* Action Buttons */}
              {isOpen && (
                <div className="flex items-center justify-end gap-1 pt-1">
                  <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                    <DialogTrigger>
                      <Button variant="default-outline" size="small">
                        <PlusIcon className="size-4" />
                        Tambah Folder
                      </Button>
                    </DialogTrigger>
                    <DialogBody
                      hideClose={isCreating}
                      className={clx(isCreating && 'items-center justify-center flex')}
                    >
                      {!isCreating && (
                        <DialogHeader className="pb-[18px]">
                          <DialogTitle>Tambah Folder</DialogTitle>
                        </DialogHeader>
                      )}

                      <DialogContent
                        className={clx(
                          'p-6 flex flex-col gap-6 border-b border-t border-otl-gray-200 ',
                          isCreating && 'border-none'
                        )}
                      >
                        {/* for myds issue for throwing error */}
                        <DialogDescription className="hidden">
                          Dialog content goes here.
                        </DialogDescription>

                        {isCreating ? (
                          <div className="items-center justify-center flex flex-col gap-3 py-6 min-h-[350px]">
                            <Spinner size={'large'} />
                            <div className="font-body font-normal text-sm text-txt-black-700">
                              Folder Sedang Dicipta
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-col gap-1.5">
                              <div>Nama Folder</div>
                              <Input
                                placeholder="Nama Folder"
                                value={folderName}
                                onChange={(e) => {
                                  setFolderName(e.target.value)
                                  setShowError(false)
                                }}
                              />
                            </div>
                            {!showError && (
                              <Callout>
                                <CalloutTitle>Informasi</CalloutTitle>
                                <CalloutContent>
                                  Nama folder mestilah unik dan tidak boleh sama dengan folder yang
                                  sedia ada di dalam unit/folder ini.
                                </CalloutContent>
                              </Callout>
                            )}
                            {showError && (
                              <Callout variant={'danger'}>
                                <CalloutTitle>Ralat</CalloutTitle>
                                <CalloutContent>
                                  Nama folder ini telah wujud. Sila gunakan nama lain.
                                </CalloutContent>
                              </Callout>
                            )}
                          </>
                        )}
                      </DialogContent>
                      {!isCreating && (
                        <DialogFooter>
                          <DialogClose>
                            <Button variant="default-outline" disabled={isCreating}>
                              Batalkan
                            </Button>
                          </DialogClose>
                          <Button
                            variant="primary-fill"
                            disabled={!folderName.trim() || isCreating}
                            onClick={() => handleAddFolder(unit.name)}
                          >
                            Tambah Folder
                          </Button>
                        </DialogFooter>
                      )}
                    </DialogBody>
                  </Dialog>

                  <Button
                    variant="primary-fill"
                    size="small"
                    onClick={() => handleUploadClick(unit.name)}
                  >
                    <UploadIcon className="h-4 w-4" />
                    Muat Naik Dokumen
                  </Button>
                </div>
              )}
            </div>

            <AccordionContent className="pb-0 pt-6">
              <div className="flex flex-col gap-6">
                {/* Breadcrumb Navigation */}
                {currentPath.length > 0 && (
                  <div className="flex items-center gap-3">
                    {/* Back Button */}
                    <button
                      type="button"
                      onClick={() => handleBackClick(unit.name)}
                      className="flex size-[18px] shrink-0 items-center justify-center text-txt-black-700 transition-colors hover:text-txt-black-900"
                      aria-label="Go back"
                    >
                      <ArrowBackIcon />
                    </button>

                    {/* Breadcrumb Path */}
                    <Breadcrumb>
                      <div className="relative h-[22px] shrink-0 pr-2">
                        <img
                          src={folderClose}
                          alt="Folder"
                          className="h-full w-full object-contain flex-shrink-0"
                        />
                      </div>
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
                                onClick={() => handleBreadcrumbClick(unit.name, index)}
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
                )}

                {/* Folder Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {currentFolders.length === 0 ? (
                    <p className="col-span-full py-5 text-center text-body-sm font-medium text-txt-black-500">
                      Tiada folder ditemui bagi unit ini
                    </p>
                  ) : (
                    currentFolders.map((folder) => (
                      <button
                        key={unit.name + '-' + folder.name}
                        onClick={() => handleFolderClick(unit.name, folder)}
                        className="flex flex-col items-center gap-3 rounded-xl p-3 border border-transparent hover:border-otl-gray-300 hover:bg-bg-secondary-50 transition-all duration-200 cursor-pointer"
                      >
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
                      </button>
                    ))
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
