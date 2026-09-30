import { useEffect, useState } from 'react'
import { Button } from '@govtechmy/myds-react/button'
import { DocumentFilledIcon } from '@govtechmy/myds-react/icon'
import {
  Dialog,
  DialogTrigger,
  DialogBody,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from '@govtechmy/myds-react/dialog'
import MetadataSummary from '@/components/shared/MetadataSummary'
import type { MetadataDocument } from '@/services/metadata.svc'
import RecordHistoryList from './RecordHistoryList'

interface DialogMetadataInfoProps {
  metadataDocument?: MetadataDocument | null
}

export default function DialogMetadataInfo({ metadataDocument }: DialogMetadataInfoProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isReferenceCopied, setIsReferenceCopied] = useState(false)

  const lokasiFolder = metadataDocument?.recordData?.path?.trim() ?? ''
  const tajuk = metadataDocument?.requiredMetadata
    ?.find((item) => item.key === 'TAJUK')
    ?.value?.trim()
  const reference =
    lokasiFolder && tajuk
      ? `${lokasiFolder.slice(0, lokasiFolder.lastIndexOf('/') + 1)}${tajuk}`
      : ''

  useEffect(() => {
    if (!isReferenceCopied) {
      return
    }

    const timer = window.setTimeout(() => {
      setIsOpen(false)
      setIsReferenceCopied(false)
    }, 3000)

    return () => window.clearTimeout(timer)
  }, [isReferenceCopied])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setIsReferenceCopied(false)
    }
  }

  const handleCopyReference = async () => {
    if (!reference) {
      return
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(reference)
      } else {
        // Do not remove: navigator.clipboard is unavailable on non-HTTPS origins,
        // so this textarea fallback keeps copy working on HTTP environments for now.
        const textArea = document.createElement('textarea')
        textArea.value = reference
        textArea.setAttribute('readonly', '')
        textArea.style.position = 'absolute'
        textArea.style.left = '-9999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }

      setIsReferenceCopied(true)
    } catch {
      setIsReferenceCopied(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <Button variant="default-outline" size="small" className="gap-1.5">
          <DocumentFilledIcon className="size-4" />
          Lihat Metadata
        </Button>
      </DialogTrigger>
      <DialogBody className="w-full max-w-[calc(100dvw-36px)] sm:max-w-2xl lg:max-w-4xl [&>button]:p-2 [&>button_svg]:size-4">
        <DialogHeader className="pb-4.5">
          <DialogTitle>Lihat Metadata</DialogTitle>
        </DialogHeader>
        <DialogContent className="border-y border-otl-gray-200 p-6 max-h-[600px] overflow-y-auto">
          <DialogDescription className="hidden">Dialog content goes here.</DialogDescription>
          <div className="flex flex-col gap-6">
            <MetadataSummary metadata={metadataDocument} />
            {metadataDocument?.recordHistory && metadataDocument.recordHistory.length > 0 && (
              <RecordHistoryList history={metadataDocument.recordHistory} />
            )}
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="primary-fill" onClick={handleCopyReference} disabled={!reference}>
            {isReferenceCopied ? 'Rujukan Disalin !' : 'Salin Rujukan'}
          </Button>
        </DialogFooter>
      </DialogBody>
    </Dialog>
  )
}
