import {
  Dialog,
  DialogBody,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@govtechmy/myds-react/dialog'
import { Button } from '@govtechmy/myds-react/button'
import {
  Radio,
  RadioItem,
  RadioButton,
  RadioLabel,
  RadioHintText,
} from '@govtechmy/myds-react/radio'
import { TextArea } from '@govtechmy/myds-react/textarea'
import { useState } from 'react'

interface ModalTakDiluluskanProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}

export default function ModalTakDiluluskan({
  isOpen,
  onClose,
  onConfirm,
}: ModalTakDiluluskanProps) {
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [customReason, setCustomReason] = useState<string>('')

  const isConfirmDisabled =
    !selectedReason || (selectedReason === 'sebab-lain' && !customReason.trim())

  const handleClose = () => {
    setSelectedReason('')
    setCustomReason('')
    onClose()
  }

  const handleConfirm = () => {
    let reason = 'TIDAK_LENGKAP'

    if (selectedReason === 'format-tidak-tepat') {
      reason = 'TIDAK_TEPAT'
    } else if (selectedReason === 'tidak-lengkap') {
      reason = 'TIDAK_LENGKAP'
    } else if (selectedReason === 'sebab-lain') {
      reason = `LAIN_LAIN : ${customReason.trim()}`
    }

    setSelectedReason('')
    setCustomReason('')
    onConfirm(reason)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogBody className="lg:min-w-[750px] lg:min-h-[750px]">
        <DialogHeader className="pb-4.5">
          <DialogTitle>Ulasan Tidak Meluluskan</DialogTitle>
        </DialogHeader>
        <DialogContent className="border-y border-otl-gray-200 p-6 flex-1 [&>button]:p-1 [&>button_svg]:size-3.5">
          <DialogDescription className="hidden"> </DialogDescription>
          <Radio>
            <RadioItem>
              <RadioButton
                value="tidak-lengkap"
                id="tidak-lengkap"
                onClick={() => setSelectedReason('tidak-lengkap')}
              />
              <div className="grid">
                <RadioLabel htmlFor="tidak-lengkap">Maklumat tidak lengkap</RadioLabel>
                <RadioHintText htmlFor="tidak-lengkap">
                  Maklumat penting tidak terdapat dalam dokumen
                </RadioHintText>
              </div>
            </RadioItem>
            <RadioItem>
              <RadioButton
                value="format-tidak-tepat"
                id="format-tidak-tepat"
                onClick={() => setSelectedReason('format-tidak-tepat')}
              />
              <div className="grid">
                <RadioLabel htmlFor="format-tidak-tepat">Format tidak tepat</RadioLabel>
                <RadioHintText htmlFor="format-tidak-tepat">
                  Dokumen tidak mengikut format yang betul
                </RadioHintText>
              </div>
            </RadioItem>
            <RadioItem>
              <RadioButton
                value="sebab-lain"
                id="sebab-lain"
                onClick={() => setSelectedReason('sebab-lain')}
              />
              <div className="flex w-full flex-col">
                <RadioLabel htmlFor="sebab-lain">Sebab-sebab lain</RadioLabel>
              </div>
            </RadioItem>
          </Radio>

          {selectedReason === 'sebab-lain' && (
            <TextArea
              className="mt-6 w-full"
              placeholder="Nyatakan ulasan tidak meluluskan dokumen."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            />
          )}
        </DialogContent>

        <DialogFooter>
          <Button variant="default-outline" onClick={handleClose}>
            Batalkan
          </Button>
          <Button variant="danger-fill" onClick={handleConfirm} disabled={isConfirmDisabled}>
            Teruskan
          </Button>
        </DialogFooter>
      </DialogBody>
    </Dialog>
  )
}
