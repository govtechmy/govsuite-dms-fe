import { create } from 'zustand'

export type GlobalFolderInfo = {
  folderId: string
  folderPath: string
}

type GlobalFolderInfoStore = {
  globalFolderInfo: GlobalFolderInfo | null
  setGlobalFolderInfo: (value: GlobalFolderInfo) => void
  resetGlobalFolderInfo: () => void
}

export const useGlobalFolderInfoStore = create<GlobalFolderInfoStore>((set) => ({
  globalFolderInfo: null,
  setGlobalFolderInfo: (value) => set({ globalFolderInfo: value }),
  resetGlobalFolderInfo: () => set({ globalFolderInfo: null }),
}))
