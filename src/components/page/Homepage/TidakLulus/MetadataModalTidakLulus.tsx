import { Button } from '@govtechmy/myds-react/button'
import {
  Dialog,
  DialogBody,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@govtechmy/myds-react/dialog'
import { TrashIcon } from '@govtechmy/myds-react/icon'
import {
  SummaryList,
  SummaryListBody,
  SummaryListRow,
  SummaryListTerm,
  SummaryListDetail,
  SummaryListAction,
} from '@govtechmy/myds-react/summary-list'
import { useNavigate, useParams } from 'react-router-dom'

type MetadataModalTidakLulusProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  lokasiFolder: string
}

export default function MetadataModalTidakLulus({
  open,
  onOpenChange,
  lokasiFolder,
}: MetadataModalTidakLulusProps) {
  const navigate = useNavigate()
  const { lang } = useParams()

  const handleResubmitClick = () => {
    const currentLang = lang ?? localStorage.getItem('lang') ?? 'ms'
    navigate(`/${currentLang}/muatnaik-dokumen`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogBody className="lg:min-w-[750px] lg:min-h-[400px]">
        <DialogHeader className="pb-4.5">
          <DialogTitle>Metadata</DialogTitle>
        </DialogHeader>
        <DialogContent className=" border-y border-otl-gray-200 p-6 [&>button]:p-1 [&>button_svg]:size-3.5">
          <DialogDescription className="hidden">Dialog content goes here.</DialogDescription>
          <SummaryList>
            <SummaryListBody>
              <SummaryListRow>
                <SummaryListTerm className="font-medium">Lokasi Folder</SummaryListTerm>
                <SummaryListDetail>{lokasiFolder}</SummaryListDetail>
                <SummaryListAction></SummaryListAction>
              </SummaryListRow>

              <SummaryListRow>
                <SummaryListTerm className="font-medium">Jenis</SummaryListTerm>
                <SummaryListDetail>Minit Mesyuarat</SummaryListDetail>
                <SummaryListAction></SummaryListAction>
              </SummaryListRow>

              <SummaryListRow>
                <SummaryListTerm className="font-medium">Unit</SummaryListTerm>
                <SummaryListDetail>Unit K</SummaryListDetail>
                <SummaryListAction></SummaryListAction>
              </SummaryListRow>

              <SummaryListRow>
                <SummaryListTerm className="font-medium">Tarikh Muat Naik</SummaryListTerm>
                <SummaryListDetail>10/01/2024</SummaryListDetail>
                <SummaryListAction></SummaryListAction>
              </SummaryListRow>

              <SummaryListRow>
                <SummaryListTerm className="font-medium">Nama Pemuat Naik</SummaryListTerm>
                <SummaryListDetail>Mohd Muzakkir Zamani Bin Fairuzzaki</SummaryListDetail>
                <SummaryListAction></SummaryListAction>
              </SummaryListRow>

              <SummaryListRow>
                <SummaryListTerm className="font-medium">Sebab Tidak Diluluskan</SummaryListTerm>
                <SummaryListDetail className="text-txt-danger">
                  Maklumat Tidak Lengkap
                </SummaryListDetail>
                <SummaryListAction></SummaryListAction>
              </SummaryListRow>
            </SummaryListBody>
          </SummaryList>
        </DialogContent>
        <DialogFooter className="flex justify-between">
          <DialogClose>
            <Button variant="danger-outline">
              <TrashIcon />
              Padamkan
            </Button>
          </DialogClose>
          <DialogClose>
            <Button variant="primary-fill" onClick={handleResubmitClick}>
              Hantar Semula
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogBody>
    </Dialog>
  )
}
