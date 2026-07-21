import { create } from 'zustand'

import { type ShareUser, type ShareUserGroup } from '@/services/shareDocument.svc'

type ShareDocumentStore = {
  availableUsers: ShareUser[] | null
  availableUserGroups: ShareUserGroup[] | null
  currentApprovedUsers: ShareUser[] | null
  setAvailableUsers: (users: ShareUser[] | null) => void
  setAvailableUserGroups: (groups: ShareUserGroup[] | null) => void
  setCurrentApprovedUsers: (users: ShareUser[] | null) => void
  resetShareDocumentState: () => void
}

export const useShareDocumentStore = create<ShareDocumentStore>((set) => ({
  availableUsers: null,
  availableUserGroups: null,
  currentApprovedUsers: null,

  setAvailableUsers: (users) => set({ availableUsers: users }),
  setAvailableUserGroups: (groups) => set({ availableUserGroups: groups }),
  setCurrentApprovedUsers: (users) => set({ currentApprovedUsers: users }),

  resetShareDocumentState: () =>
    set({
      availableUsers: null,
      availableUserGroups: null,
      currentApprovedUsers: null,
    }),
}))
