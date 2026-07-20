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
  DialogClose,
} from '@govtechmy/myds-react/dialog'
import MetadataSummary from '@/components/shared/MetadataSummary'
import type { MetadataDocument } from '@/services/metadata.svc'

interface DialogMetadataInfoProps {
  metadataDocument?: MetadataDocument | null
}

export default function DialogMetadataInfo({ metadataDocument }: DialogMetadataInfoProps) {
  return (
    <Dialog>
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
          </div>
        </DialogContent>
        <DialogFooter>
          <DialogClose>
            <Button variant="primary-fill">Salin Rujukan</Button>
          </DialogClose>
        </DialogFooter>
      </DialogBody>
    </Dialog>
  )
}
