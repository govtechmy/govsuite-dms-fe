import { create } from 'zustand'

//FIX THIS INTERFACE LATER ON IMPLEMENTING
export interface UnifiedUploadFileProps {
  // File information
  name?: string
  lastModified?: number
  lastModifiedDate?: string
  webkitRelativePath?: string
  size?: number
  type?: string
  rawFile?: File // Raw File object for S3 upload

  // Upload parameters
  s3Url?: string
  baseUrl?: string
  body?: {
    terasId?: string
    fileName: string
    originalFileName: string
    fileType: string
    fileSize: number | string
    fileExtension: string
  }
}

export type UploadState = 1 | 2 | 3 | 4

// References
//  1 = no upload/get
//  2 = uploading/getting
//  3 = uploaded/obtained
//  4 = upload fail /get fail
export type UploadStore = {
  selectedFile: UnifiedUploadFileProps | null
  isRenderingInfoDoc: boolean
  isRenderingFullDoc: boolean
  sendState: UploadState
  uploadState: UploadState
  previewInfoDocumentFetchState: UploadState
  previewDocumentFetchState: UploadState
  setIsRenderingFullDoc: (v: boolean) => void
  setIsRenderingInfoDoc: (v: boolean) => void
  setSelectedFile: (v: UnifiedUploadFileProps | null) => void
  setSendState: (v: UploadState) => void
  setUploadState: (v: UploadState) => void
  setPreviewInfoDocumentFetchState: (v: UploadState) => void
  setPreviewDocumentFetchState: (v: UploadState) => void
}

export const useUploadStore = create<UploadStore>((set) => ({
  uploadState: 1,
  sendState: 1,
  previewInfoDocumentFetchState: 1,
  previewDocumentFetchState: 1,

  selectedFile: null,

  isRenderingInfoDoc: false,
  isRenderingFullDoc: false,

  setUploadState: (v: UploadState) => set({ uploadState: v }),
  setSendState: (v: UploadState) => set({ sendState: v }),
  setPreviewInfoDocumentFetchState: (v: UploadState) => set({ previewInfoDocumentFetchState: v }),
  setPreviewDocumentFetchState: (v: UploadState) => set({ previewDocumentFetchState: v }),
  setSelectedFile: (v: UnifiedUploadFileProps | null) => set({ selectedFile: v }),
  setIsRenderingInfoDoc: (v) => set({ isRenderingInfoDoc: v }),
  setIsRenderingFullDoc: (v) => set({ isRenderingFullDoc: v }),
}))
