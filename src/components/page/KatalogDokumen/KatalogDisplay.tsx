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
import folderOpen from '@/assets/Icons/Folder_open.png'
import folderClose from '@/assets/Icons/Folder_close.png'
import { useFolderLocationStore } from '@/store/FolderLocationStore'
import { getCatalogUnits } from '@/services/catalog.svc'
import Excerpts from '@/components/shared/Excerpts'
import { clx } from '@govtechmy/myds-react/utils'
import TambahFolderModal from './TambahFolderModal'
import FolderGrid from '@/components/shared/FolderGrid'

export interface Unit {
  name: string
  type: 'folder'
  hasChildren: boolean
  path: string
  value?: number
  children?: Unit[]
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
  const [currentPaths, setCurrentPaths] = useState<Record<string, Unit[]>>({})
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [activeUnit, setActiveUnit] = useState<string>('')
  const [loadingFolders, setLoadingFolders] = useState<Record<string, boolean>>({})

  const handleFolderClick = async (unitName: string, folder: Unit) => {
    const loadingKey = `${unitName}-${folder.path}`
    setLoadingFolders((prev) => ({ ...prev, [loadingKey]: true }))

    try {
      // Always fetch from API when clicking a folder
      const fetchedChildren = await getCatalogUnits(folder.path)

      // Update the units state with the fetched children
      setUnits((prevUnits) => {
        return prevUnits.map((unit) => {
          if (unit.name !== unitName) return unit

          const currentPath = currentPaths[unitName] || []

          // If we're at root level, update the root folder
          if (currentPath.length === 0) {
            return {
              ...unit,
              children: (unit.children || []).map((item) =>
                item.path === folder.path
                  ? { ...item, children: fetchedChildren, hasChildren: fetchedChildren.length > 0 }
                  : item
              ),
            }
          }

          // Helper function to update nested children
          const updateFolderChildren = (items: Unit[], targetPath: string): Unit[] => {
            return items.map((item) => {
              if (item.path === targetPath) {
                return {
                  ...item,
                  children: fetchedChildren,
                  hasChildren: fetchedChildren.length > 0,
                }
              }
              if (item.children) {
                return {
                  ...item,
                  children: updateFolderChildren(item.children, targetPath),
                }
              }
              return item
            })
          }

          return {
            ...unit,
            children: updateFolderChildren(unit.children || [], folder.path),
          }
        })
      })

      // Navigate into the folder after loading
      setCurrentPaths((prev) => ({
        ...prev,
        [unitName]: [...(prev[unitName] || []), { ...folder, children: fetchedChildren }],
      }))
    } catch (error) {
      console.error('Error fetching folder contents:', error)
    } finally {
      setLoadingFolders((prev) => ({ ...prev, [loadingKey]: false }))
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
      [unitName]: index === -1 ? [] : (prev[unitName] || []).slice(0, index + 1),
    }))
  }

  const handleAccordionChange = (values: string[]) => {
    setOpenUnits(values)
  }

  const handleAddFolder = (folderName: string) => {
    const unitName = activeUnit
    const currentPath = currentPaths[unitName] || []

    // Get current unit
    const currentUnit = units.find((u) => u.name === unitName)
    if (!currentUnit) return

    const basePath =
      currentPath.length === 0 ? `/${currentUnit.name}` : currentPath[currentPath.length - 1].path

    const newFolder: Unit = {
      name: folderName,
      type: 'folder',
      hasChildren: false,
      path: `${basePath}/${folderName}`,
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
            hasChildren: true,
            children: [...(unit.children || []), newFolder],
          }
        } else {
          // Add to nested folder
          const updateChildren = (items: Unit[], pathIndex: number): Unit[] => {
            return items.map((item) => {
              if (item.name === currentPath[pathIndex].name) {
                if (pathIndex === currentPath.length - 1) {
                  // This is the target folder
                  return {
                    ...item,
                    hasChildren: true,
                    children: [...(item.children || []), newFolder],
                  }
                } else {
                  // Need to go deeper
                  return {
                    ...item,
                    children: updateChildren(item.children || [], pathIndex + 1),
                  }
                }
              }
              return item
            })
          }

          return {
            ...unit,
            children: updateChildren(unit.children || [], 0),
          }
        }
      })
    })
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
        const allItems =
          currentPath.length === 0
            ? unit.children || []
            : currentPath[currentPath.length - 1].children || []

        // Separate folders and documents
        const currentFolders = allItems.filter((item) => item.type === 'folder')
        const currentDocuments = allItems.filter((item) => item.type !== 'folder')

        // Get existing folder names for validation
        const existingFolderNames = currentFolders.map((folder) => folder.name)

        return (
          <AccordionItem key={unit.name} value={unit.name} className="border-none">
            <div className="flex flex-col gap-1">
              {/* Title Row */}
              <AccordionTrigger className="py-0 hover:no-underline">
                <div className="flex w-full items-center gap-3 text-left">
                  {currentPath.length > 0 ? (
                    <>
                      {/* Back Button */}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBackClick(unit.name)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            e.stopPropagation()
                            handleBackClick(unit.name)
                          }
                        }}
                        className="flex size-[18px] shrink-0 items-center justify-center text-txt-black-700 transition-colors hover:text-txt-black-900 cursor-pointer"
                        aria-label="Go back"
                      >
                        <ArrowBackIcon />
                      </div>

                      {/* Breadcrumb Path */}
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
                            onClick={(e) => {
                              e.stopPropagation()
                              handleBreadcrumbClick(unit.name, -1)
                            }}
                            className="cursor-pointer font-semibold text-[18px] leading-[26px] hover:text-txt-black-900"
                          >
                            {unit.name}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        {currentPath.map((pathItem, index) => (
                          <div key={pathItem.name} className="flex items-center">
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              {index === currentPath.length - 1 ? (
                                <BreadcrumbPage className="font-semibold text-[18px] leading-[26px]">
                                  {pathItem.name}
                                </BreadcrumbPage>
                              ) : (
                                <BreadcrumbLink
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleBreadcrumbClick(unit.name, index)
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

              {/* Action Buttons */}
              {isOpen && (
                <div className="flex items-center justify-end gap-1 pt-1">
                  <TambahFolderModal
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    onAddFolder={handleAddFolder}
                    existingFolders={existingFolderNames}
                    trigger={
                      <Button
                        variant="default-outline"
                        size="small"
                        onClick={() => {
                          setActiveUnit(unit.name)
                          setDialogOpen(true)
                        }}
                      >
                        <PlusIcon className="size-4" />
                        Tambah Folder
                      </Button>
                    }
                  />

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
              <div
                className={clx(
                  'flex flex-col',
                  currentFolders.length > 0 && currentDocuments.length > 0 && 'gap-6'
                )}
              >
                {/* Folder Grid */}
                {currentFolders.length === 0 && currentDocuments.length === 0 ? (
                  <FolderGrid
                    folders={[]}
                    loadingFolders={loadingFolders}
                    unitName={unit.name}
                    onFolderClick={(folder) => handleFolderClick(unit.name, folder)}
                    emptyMessage="Tiada folder ditemui bagi unit ini"
                  />
                ) : (
                  currentFolders.length > 0 && (
                    <FolderGrid
                      folders={currentFolders}
                      loadingFolders={loadingFolders}
                      unitName={unit.name}
                      onFolderClick={(folder) => handleFolderClick(unit.name, folder)}
                    />
                  )
                )}

                {/* Documents Section */}
                {currentDocuments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-otl-gray-200">
                    {currentDocuments.map((doc: any) => (
                      <Excerpts
                        key={doc.path}
                        date={doc.date}
                        secretTag={doc.peringkat_keselamatan}
                        statusTag={doc.status}
                        title={doc.document_name}
                        type={doc.meta_info?.documentType || doc.type}
                        unit={unit.name}
                      />
                    ))}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
