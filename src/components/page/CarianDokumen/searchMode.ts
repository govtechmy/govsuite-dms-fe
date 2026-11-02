export const SEARCH_MODE_PARAM = 'searchMode'

export const SEARCH_MODE = {
  TEKS: 'teks',
  HIBRID: 'hibrid',
} as const

export type SearchMode = (typeof SEARCH_MODE)[keyof typeof SEARCH_MODE]

export const DEFAULT_SEARCH_MODE: SearchMode = SEARCH_MODE.TEKS
