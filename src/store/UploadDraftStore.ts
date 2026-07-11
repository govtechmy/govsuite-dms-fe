import { create } from 'zustand'

export type UploadState = 1 | 2 | 3 | 4

// References
//  1 = no upload/get
//  2 = uploading/getting
//  3 = uploaded/obtained
//  4 = upload fail /get fail

interface PreviewDocumentInfo {
  fileName: string
}

export type UploadDraftStore = {
  // Form draft fields
  selectedPeringkatKeselamatan: string
  ringkasan: string
  metadataValues: Record<string, string>
  tempatMesyuarat: string
  bilanganHelaian: string
  jenisKemasukan: string

  // Upload state fields
  uploadState: UploadState
  uploadErrorMessage: string
  previewDocumentInfoData: PreviewDocumentInfo | null

  // Actions
  setSelectedPeringkatKeselamatan: (value: string) => void
  setRingkasan: (value: string) => void
  setMetadataValues: (values: Record<string, string>) => void
  setMetadataValue: (key: string, value: string) => void
  setTempatMesyuarat: (value: string) => void
  setBilanganHelaian: (value: string) => void
  setJenisKemasukan: (value: string) => void
  setUploadState: (state: UploadState) => void
  setUploadErrorMessage: (message: string) => void
  setPreviewDocumentInfoData: (data: PreviewDocumentInfo | null) => void
  resetDraft: () => void
}

const initialState = {
  selectedPeringkatKeselamatan: '',
  ringkasan: '',
  metadataValues: {},
  tempatMesyuarat: '',
  bilanganHelaian: '',
  jenisKemasukan: '',
  uploadState: 1 as UploadState,
  uploadErrorMessage: '',
  previewDocumentInfoData: null,
}

export const useUploadDraftStore = create<UploadDraftStore>((set) => ({
  ...initialState,

  setSelectedPeringkatKeselamatan: (value: string) => set({ selectedPeringkatKeselamatan: value }),

  setRingkasan: (value: string) => set({ ringkasan: value }),

  setMetadataValues: (values: Record<string, string>) => set({ metadataValues: values }),

  setMetadataValue: (key: string, value: string) =>
    set((state) => ({
      metadataValues: { ...state.metadataValues, [key]: value },
    })),

  setTempatMesyuarat: (value: string) => set({ tempatMesyuarat: value }),

  setBilanganHelaian: (value: string) => set({ bilanganHelaian: value }),

  setJenisKemasukan: (value: string) => set({ jenisKemasukan: value }),

  setUploadState: (state: UploadState) => set({ uploadState: state }),

  setUploadErrorMessage: (message: string) => set({ uploadErrorMessage: message }),

  setPreviewDocumentInfoData: (data: PreviewDocumentInfo | null) =>
    set({ previewDocumentInfoData: data }),

  resetDraft: () => set(initialState),
}))
