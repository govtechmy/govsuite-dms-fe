import { useState } from 'react'
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

export default function KatalogDisplay({ units }: KatalogUnitProps) {
  const [openUnits, setOpenUnits] = useState<string[]>([])
  const [currentPaths, setCurrentPaths] = useState<Record<string, KatalogUnitItem[]>>({})

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
                  <Button variant="default-outline" size="small">
                    <PlusIcon className="size-4" />
                    Tambah Folder
                  </Button>
                  <Button variant="primary-fill" size="small">
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
