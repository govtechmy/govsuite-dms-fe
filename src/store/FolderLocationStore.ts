import { create } from 'zustand'

export type FolderLocationStore = {
  folderPath: string
  setFolderPath: (path: string) => void
  resetFolderPath: () => void
}

export const useFolderLocationStore = create<FolderLocationStore>((set) => ({
  folderPath: '',
  setFolderPath: (path: string) => set({ folderPath: path }),
  resetFolderPath: () => set({ folderPath: '' }),
}))
