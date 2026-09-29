import { type UploadState, useUploadStore } from '@/store/UploadStore'
import { DEFAULT_MAX_FILE_SIZE_MB } from '@/services/upload.svc'
import formatFileSize from '@/utils/FormatFileSize'
import getFileIcon from '@/utils/GetFileIcon'
import { Button, ButtonIcon } from '@govtechmy/myds-react/button'
import { CrossIcon, UploadIcon } from '@govtechmy/myds-react/icon'
import { Spinner } from '@govtechmy/myds-react/spinner'
import { Tag } from '@govtechmy/myds-react/tag'
import { Tooltip, TooltipTrigger, TooltipContent } from '@govtechmy/myds-react/tooltip'
import { useRef } from 'react'

interface UploadDocumentProps {
  handleFileUploadChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleResetClick: () => void
  handleDisabledButton: () => boolean
  uploadState: UploadState
  fileType: string
  maxFileSizeMb?: number
  displayFileName?: string
  uploadErrorMessage?: string
  uploadPercentage?: number
  lastUploadedFile?: FileInfo | null
  draftStatus?: boolean
}

export interface FileInfo {
  path: string
  type: string
  extension: string
  sizeMb: number
  name: string
}

export default function UploadDocument({
  handleFileUploadChange,
  handleResetClick,
  handleDisabledButton,
  uploadState,
  fileType,
  maxFileSizeMb,
  displayFileName,
  uploadErrorMessage,
  uploadPercentage,
  lastUploadedFile,
  draftStatus,
}: UploadDocumentProps) {
  const { selectedFile } = useUploadStore()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const fileTypeLabel = fileType
    .split(',')
    .map((value) => value.trim().replace(/^\./, '').toUpperCase())
    .filter(Boolean)
    .join(', ')

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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-body font-medium text-body-md text-txt-black-900">
            Muat Naik Dokumen
          </div>
          <Tooltip>
            <TooltipTrigger className="flex font-body font-normal text-body-sm text-txt-black-500">
              Jenis Fail: {fileTypeLabel}
            </TooltipTrigger>
            <TooltipContent className="max-w-[280px]">
              Jenis fail disemak berdasarkan sambungan nama fail. Fail tanpa sambungan yang betul
              akan ditolak walaupun kandungannya sah, contohnya dokumen PDF yang namanya tidak
              berakhir dengan .pdf. Sila pastikan nama fail mempunyai sambungan yang betul sebelum
              dimuat naik.
            </TooltipContent>
          </Tooltip>
          <div className="font-body font-normal text-body-sm text-txt-black-500">
            Saiz Maksima: {maxFileSizeMb ?? DEFAULT_MAX_FILE_SIZE_MB}MB
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
            <div className="text-start w-full min-w-0">
              <div className="flex gap-1">
                <div className="flex-1 min-w-0 truncate">
                  {displayFileName ? displayFileName : selectedFile?.body?.fileName}
                </div>
                <div>{selectedFile?.name?.split('.').pop()}</div>
              </div>
              <div className="text-txt-black-500 text-xs">
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

        {draftStatus && lastUploadedFile && (
          <>
            <div className="text-body-sm font-semibold text-txt-black-900 mt-4">Fail Sedia Ada</div>
            <div className="border border-otl-gray-200 max-w-[217px] rounded-lg flex items-center justify-start p-2 gap-2 mt-4 bg-otl-gray-200 opacity-60">
              {getFileIcon({
                name: lastUploadedFile.name || '',
                type: lastUploadedFile.type || '',
                body: {
                  fileName: lastUploadedFile.name || '',
                  originalFileName: lastUploadedFile.name || '',
                  fileType: lastUploadedFile.type || '',
                  fileSize: Math.round(lastUploadedFile.sizeMb * 1024 * 1024) || '',
                  fileExtension: lastUploadedFile.extension || '',
                },
              })}
              <div className="text-start w-full min-w-0">
                {selectedFile && (
                  <Tag mode="pill" size="small" variant="default">
                    Digantikan
                  </Tag>
                )}
                <div className="flex gap-1">
                  <div className="flex-1 min-w-0 truncate">{lastUploadedFile.name}</div>
                  <div>{lastUploadedFile.extension ? `.${lastUploadedFile.extension}` : ''}</div>
                </div>
                <div className="text-txt-black-500 text-xs">
                  {formatFileSize(Math.round(lastUploadedFile.sizeMb * 1024 * 1024))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
