import { type UploadState, useUploadStore } from '@/store/UploadStore'
import formatFileSize from '@/utils/FormatFileSize'
import getFileIcon from '@/utils/GetFileIcon'
import { Button, ButtonIcon } from '@govtechmy/myds-react/button'
import { CrossIcon, UploadIcon } from '@govtechmy/myds-react/icon'
import { Spinner } from '@govtechmy/myds-react/spinner'
import { useRef } from 'react'

interface UploadDocumentProps {
  handleFileUploadChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleResetClick: () => void
  handleDisabledButton: () => boolean
  uploadState: UploadState
  fileType: string
  displayFileName?: string
  uploadErrorMessage?: string
  uploadPercentage?: number
}

export default function UploadDocument({
  handleFileUploadChange,
  handleResetClick,
  handleDisabledButton,
  uploadState,
  fileType,
  displayFileName,
  uploadErrorMessage,
  uploadPercentage,
}: UploadDocumentProps) {
  const { selectedFile } = useUploadStore()

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    handleResetClick()
  }

  return (
    <div className="border border-otl-gray-200 p-4 rounded-md">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-body font-medium text-body-md text-txt-black-900">
            Muat Naik Dokumen
          </div>
          <div className="font-body font-normal text-body-sm text-txt-black-500">
            Jenis Fail: {fileType.toUpperCase()}
          </div>
          <div className="font-body font-normal text-body-sm text-txt-black-500">
            Saiz Maksima: 25MB
          </div>
        </div>
        <Button
          variant="default-outline"
          className="font-body font-medium text-body-md text-txt-black-700"
          onClick={handleUploadClick}
          disabled={handleDisabledButton()}
        >
          <ButtonIcon>
            <UploadIcon />
          </ButtonIcon>
          Muat Naik
        </Button>
      </div>

      <input
        type="file"
        accept={fileType}
        ref={fileInputRef}
        onChange={handleFileUploadChange}
        className="hidden"
      />

      <div>
        {/* uploading */}
        {uploadState === 2 && (
          <div className="border border-otl-gray-200 max-w-[217px] rounded-lg flex items-center justify-start p-2 gap-2 mt-4">
            <Spinner className="p-2 pl-2.5" size="medium" />
            <div className="text-start w-full">
              {`Memuat naik..${uploadPercentage ? ` (${uploadPercentage}%)` : ''}`}
            </div>
          </div>
        )}

        {/* uploaded */}
        {uploadState === 3 && selectedFile && (
          <div className="border border-otl-gray-200 max-w-[217px] rounded-lg flex items-center justify-start p-2 gap-2 mt-4">
            {getFileIcon(selectedFile)}
            <div className="text-start w-full">
              <div className="flex gap-1">
                <div className="max-w-[85px] truncate">
                  {displayFileName ? displayFileName : selectedFile?.body?.fileName}
                </div>
                <div>{selectedFile?.name?.split('.').pop()}</div>
              </div>
              <div className="text-[#71717A] text-xs">
                {selectedFile && selectedFile?.body?.fileSize !== undefined
                  ? formatFileSize(Number(selectedFile.body.fileSize))
                  : ''}
              </div>
            </div>
            <Button
              onClick={handleRemoveClick}
              variant="unset"
              className="p-2 text-txt-danger hover:bg-danger-50"
            >
              <ButtonIcon>
                <CrossIcon />
              </ButtonIcon>
            </Button>
          </div>
        )}

        {/* failed */}
        {uploadState === 4 && (
          <div className="text-danger-700 text-sm font-body mt-4">
            {uploadErrorMessage ?? 'Upload gagal. Cuba lagi.'}
          </div>
        )}
      </div>
    </div>
  )
}
