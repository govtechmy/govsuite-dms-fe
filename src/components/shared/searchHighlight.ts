import { Extension, type Editor } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { PdfMatchPage } from './PdfJsDocumentViewer'

type SearchMatchRange = {
  from: number
  to: number
  index: number
}

// 'passage' compares letters and digits only, so a backend snippet still matches the
// page when its spacing, punctuation or line-break hyphenation differs from the HTML
export type SearchMatchMode = 'exact' | 'passage'

interface SearchHighlightState {
  keyword: string
  matchMode: SearchMatchMode
  activeIndex: number
  totalMatches: number
  ranges: SearchMatchRange[]
  matchPages: PdfMatchPage[]
  decorations: DecorationSet
}

type SearchHighlightMeta = {
  keyword?: string
  matchMode?: SearchMatchMode
  activeIndex?: number
}

export const searchHighlightKey = new PluginKey<SearchHighlightState>('searchHighlight')

// Text is split across styled spans and per-line blocks, so join it into one
// string and map each match back to document positions. A match spanning
// several text nodes becomes several ranges sharing the same index.
// Matches are grouped by the 1-based page they start on.
const PASSAGE_CHARACTER = /[\p{L}\p{N}]/u

// Returns the text to search and, in passage mode, the fullText index of each character
const toSearchableText = (text: string, matchMode: SearchMatchMode) => {
  if (matchMode === 'exact') {
    return { text: text.toLocaleLowerCase(), offsets: null }
  }

  let searchable = ''
  const offsets: number[] = []
  for (let index = 0; index < text.length; index += 1) {
    if (PASSAGE_CHARACTER.test(text[index])) {
      searchable += text[index]
      offsets.push(index)
    }
  }
  return { text: searchable.toLocaleLowerCase(), offsets }
}

const findMatches = (doc: ProseMirrorNode, keyword: string, matchMode: SearchMatchMode) => {
  const ranges: SearchMatchRange[] = []
  const matchPages: PdfMatchPage[] = []

  if (!keyword) {
    return { ranges, matchPages, totalMatches: 0 }
  }

  let fullText = ''
  let startsNewBlock = false
  let pageNumber = 0
  const segments: { start: number; end: number; pos: number; page: number }[] = []

  doc.descendants((node, pos) => {
    if (node.type.name === 'page') {
      pageNumber += 1
    }

    if (!node.isText) {
      if (node.isTextblock || node.isInline) {
        startsNewBlock = true
      }
      return
    }

    const text = node.text ?? ''
    if (startsNewBlock && fullText && !/\s$/.test(fullText) && !/^\s/.test(text)) {
      fullText += ' '
    }
    startsNewBlock = false

    segments.push({
      start: fullText.length,
      end: fullText.length + text.length,
      pos,
      page: pageNumber,
    })
    fullText += text
  })

  const searchable = toSearchableText(fullText, matchMode)
  const searchKeyword = toSearchableText(keyword, matchMode).text
  if (!searchKeyword) {
    return { ranges, matchPages, totalMatches: 0 }
  }

  let totalMatches = 0
  let segmentPointer = 0
  let searchableMatchStart = searchable.text.indexOf(searchKeyword)

  while (searchableMatchStart >= 0) {
    const searchableMatchEnd = searchableMatchStart + searchKeyword.length
    const searchPosition = searchable.offsets?.[searchableMatchStart] ?? searchableMatchStart
    const matchEnd = searchable.offsets
      ? searchable.offsets[searchableMatchEnd - 1] + 1
      : searchableMatchEnd

    while (segmentPointer < segments.length && segments[segmentPointer].end <= searchPosition) {
      segmentPointer += 1
    }

    const matchPage = segments[segmentPointer]?.page ?? pageNumber
    const lastMatchPage = matchPages[matchPages.length - 1]
    if (lastMatchPage?.page === matchPage) {
      lastMatchPage.matchCount += 1
    } else {
      matchPages.push({ page: matchPage, firstMatchIndex: totalMatches, matchCount: 1 })
    }

    for (let i = segmentPointer; i < segments.length && segments[i].start < matchEnd; i += 1) {
      const segment = segments[i]
      const from = Math.max(searchPosition, segment.start)
      const to = Math.min(matchEnd, segment.end)

      if (to > from) {
        ranges.push({
          from: segment.pos + from - segment.start,
          to: segment.pos + to - segment.start,
          index: totalMatches,
        })
      }
    }

    totalMatches += 1
    searchableMatchStart = searchable.text.indexOf(searchKeyword, searchableMatchEnd)
  }

  return { ranges, matchPages, totalMatches }
}

// Passage matches stay unstyled; the viewer outlines the whole active passage instead
const getMatchClassName = (matchMode: SearchMatchMode, isActive: boolean) => {
  if (matchMode === 'passage') return 'pdf-search-match-passage'
  return isActive ? 'pdf-search-match pdf-search-match-active' : 'pdf-search-match'
}

const buildDecorations = (
  doc: ProseMirrorNode,
  ranges: SearchMatchRange[],
  activeIndex: number,
  matchMode: SearchMatchMode
) =>
  DecorationSet.create(
    doc,
    ranges.map(({ from, to, index }) =>
      Decoration.inline(from, to, {
        nodeName: 'mark',
        class: getMatchClassName(matchMode, index === activeIndex),
        'data-search-match-index': String(index),
      })
    )
  )

/** Updates the search keyword and/or the active match of the editor. */
export const setSearchHighlight = (editor: Editor, meta: SearchHighlightMeta) => {
  editor.view.dispatch(editor.state.tr.setMeta(searchHighlightKey, meta))
}

/** Highlights keyword matches with decorations, leaving the document itself unchanged. */
export const SearchHighlight = Extension.create({
  name: 'searchHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin<SearchHighlightState>({
        key: searchHighlightKey,
        state: {
          init: () => ({
            keyword: '',
            matchMode: 'exact',
            activeIndex: -1,
            totalMatches: 0,
            ranges: [],
            matchPages: [],
            decorations: DecorationSet.empty,
          }),
          apply(tr, previous, _oldState, newState) {
            const meta = tr.getMeta(searchHighlightKey) as SearchHighlightMeta | undefined

            if (!meta && !tr.docChanged) {
              return previous
            }

            const keyword = meta?.keyword?.trim().toLocaleLowerCase() ?? previous.keyword
            const matchMode = meta?.matchMode ?? previous.matchMode
            const isNewKeyword = keyword !== previous.keyword || matchMode !== previous.matchMode
            const { ranges, matchPages, totalMatches } =
              isNewKeyword || tr.docChanged
                ? findMatches(newState.doc, keyword, matchMode)
                : previous
            // Pages loaded later are appended, which leaves earlier match indexes
            // unchanged, so the active match is kept while the keyword stays the same
            const keepsActiveMatch =
              !isNewKeyword && previous.activeIndex >= 0 && previous.activeIndex < totalMatches
            const activeIndex =
              meta?.activeIndex ??
              (keepsActiveMatch ? previous.activeIndex : totalMatches > 0 ? 0 : -1)

            return {
              keyword,
              matchMode,
              activeIndex,
              totalMatches,
              ranges,
              matchPages,
              decorations: buildDecorations(newState.doc, ranges, activeIndex, matchMode),
            }
          },
        },
        props: {
          decorations: (state) => searchHighlightKey.getState(state)?.decorations,
        },
      }),
    ]
  },
})
