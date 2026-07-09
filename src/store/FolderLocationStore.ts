import { create } from 'zustand'

export interface FolderSelection {
  path: string
  id: string
}

export type FolderLocationStore = {
  folderSelection: FolderSelection
  setFolderSelection: (selection: FolderSelection) => void
  resetFolderSelection: () => void
}

const EMPTY_SELECTION: FolderSelection = {
  path: '',
  id: '',
}

export const useFolderLocationStore = create<FolderLocationStore>((set) => ({
  folderSelection: EMPTY_SELECTION,
  setFolderSelection: (selection: FolderSelection) => set({ folderSelection: selection }),
  resetFolderSelection: () => set({ folderSelection: EMPTY_SELECTION }),
}))
