import { Button } from '@govtechmy/myds-react/button'
import { DownloadIcon, DocumentFilledIcon } from '@govtechmy/myds-react/icon'
import { DateCard } from '@/components/shared/DateCard'
import { renderStatusTag, renderSecretTag } from '@/utils/RenderTag'
import MaskHeader from '@/assets/bg-svg/MaskHeader'
import { BreadcrumbBuilder } from '@/components/shared/BreadcrumbBuilder'
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

interface HeaderDokumenIDProps {
  title: string
  path: string
  date: string
  status: string
  classification: string
  category: string
  unit: string
}

export function HeaderDokumenID({
  title,
  path,
  date,
  status,
  classification,
  category,
  unit,
}: HeaderDokumenIDProps) {
  const documentData = {
    lokasiFolder: 'JKKPN > 2020 - 2024 > 2024 > January > Minit Jemaah Menteri Bil. 12/2026',
    profilDokumen: 'Agenda Mesyuarat',
    tahapKeselamatan: 'Terhad',
    ringkasan: 'Minit Jemaah menteri membincangkan mengenai status terkini projek tebatan banjir',
    tajuk: 'Minit Jemaah Menteri Bil. 12/2026',
    tarikhMesyuarat: '10/01/2026',
    klasifikasiFail: 'JPM(R)12014/57 Jilid 51',
    namaPewujud: 'Mohd Muzakkir Zamani Bin Fairuzzaki',
    tempatMesyuarat: 'ABC Hall',
    bilanganHelaian: '25',
    jenisKemasukan: '-',
  }

  return (
    <div className="relative flex w-full flex-col gap-6 overflow-hidden border-b border-otl-gray-200 bg-[radial-gradient(ellipse_2500px_1100px_at_top,theme(colors.bg-primary-200)_1%,theme(colors.bg-primary-50)_10%)] p-8 py-12">
      <div className="pointer-events-none absolute inset-0">
        <MaskHeader className="h-full w-full" />
      </div>

      <div className="relative z-10 flex w-full max-w-[1000px] flex-col gap-6">
        <BreadcrumbBuilder path={path} />
        {/* Document Header */}
        <div className="flex w-full items-end gap-3">
          {/* Date Card */}
          <DateCard date={date} size="lg" className="shadow-sm border border-otl-gray-200" />

          {/* Content */}
          <div className="flex flex-1 flex-col gap-1.5">
            {/* Tags */}
            <div className="flex items-start gap-1">
              {renderStatusTag(status)}
              {renderSecretTag(classification)}
            </div>

            {/* Title */}
            <h1 className="line-clamp-2 text-base font-semibold text-txt-black-900">{title}</h1>

            {/* Metadata */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-txt-black-500">{category}</span>
              <div className="size-1 rounded-full bg-txt-black-500" />
              <span className="text-sm font-medium text-txt-black-500">{unit}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button variant="default-outline" size="small" className="gap-1.5">
              <DownloadIcon className="size-4" />
              Muat Turun
            </Button>

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
                  <DialogDescription className="hidden">
                    Dialog content goes here.
                  </DialogDescription>
                  <div className="flex flex-col gap-6">
                    <MetadataSummary docInfo={documentData} />
                  </div>
                </DialogContent>
                <DialogFooter>
                  <DialogClose>
                    <Button variant="primary-fill">Salin Rujukan</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogBody>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}
