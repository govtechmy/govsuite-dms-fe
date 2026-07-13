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
  // here values comes from the input, straight into Record<string, string>
  requiredMetadataValues: Record<string, string>
  additionalMetadataValues: Record<string, string>

  // Upload state fields
  uploadState: UploadState
  uploadErrorMessage: string
  previewDocumentInfoData: PreviewDocumentInfo | null

  // Actions
  setSelectedPeringkatKeselamatan: (value: string) => void
  setRingkasan: (value: string) => void
  replaceRequiredMetadata: (values: Record<string, string>) => void
  setRequiredMetadataField: (key: string, value: string) => void
  replaceAdditionalMetadata: (values: Record<string, string>) => void
  setAdditionalMetadataField: (key: string, value: string) => void
  setUploadState: (state: UploadState) => void
  setUploadErrorMessage: (message: string) => void
  setPreviewDocumentInfoData: (data: PreviewDocumentInfo | null) => void
  resetDraft: () => void
}

const initialState = {
  selectedPeringkatKeselamatan: '',
  ringkasan: '',
  requiredMetadataValues: {},
  additionalMetadataValues: {},
  uploadState: 1 as UploadState,
  uploadErrorMessage: '',
  previewDocumentInfoData: null,
}

export const useUploadDraftStore = create<UploadDraftStore>((set) => ({
  ...initialState,

  setSelectedPeringkatKeselamatan: (value: string) => set({ selectedPeringkatKeselamatan: value }),

  setRingkasan: (value: string) => set({ ringkasan: value }),

  replaceRequiredMetadata: (values: Record<string, string>) =>
    set({ requiredMetadataValues: values }),

  setRequiredMetadataField: (key: string, value: string) =>
    set((state) => ({
      requiredMetadataValues: { ...state.requiredMetadataValues, [key]: value },
    })),

  replaceAdditionalMetadata: (values: Record<string, string>) =>
    set({ additionalMetadataValues: values }),

  setAdditionalMetadataField: (key: string, value: string) =>
    set((state) => ({
      additionalMetadataValues: { ...state.additionalMetadataValues, [key]: value },
    })),

  setUploadState: (state: UploadState) => set({ uploadState: state }),

  setUploadErrorMessage: (message: string) => set({ uploadErrorMessage: message }),

  setPreviewDocumentInfoData: (data: PreviewDocumentInfo | null) =>
    set({ previewDocumentInfoData: data }),

  resetDraft: () => set(initialState),
}))
