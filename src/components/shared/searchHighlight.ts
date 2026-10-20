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

interface SearchHighlightState {
  keyword: string
  activeIndex: number
  totalMatches: number
  ranges: SearchMatchRange[]
  matchPages: PdfMatchPage[]
  decorations: DecorationSet
}

type SearchHighlightMeta = {
  keyword?: string
  activeIndex?: number
}

export const searchHighlightKey = new PluginKey<SearchHighlightState>('searchHighlight')

// Text is split across styled spans and per-line blocks, so join it into one
// string and map each match back to document positions. A match spanning
// several text nodes becomes several ranges sharing the same index.
// Matches are grouped by the 1-based page they start on.
const findMatches = (doc: ProseMirrorNode, keyword: string) => {
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

  const normalizedText = fullText.toLocaleLowerCase()
  let totalMatches = 0
  let segmentPointer = 0
  let searchPosition = normalizedText.indexOf(keyword)

  while (searchPosition >= 0) {
    const matchEnd = searchPosition + keyword.length

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
    searchPosition = normalizedText.indexOf(keyword, matchEnd)
  }

  return { ranges, matchPages, totalMatches }
}

const buildDecorations = (doc: ProseMirrorNode, ranges: SearchMatchRange[], activeIndex: number) =>
  DecorationSet.create(
    doc,
    ranges.map(({ from, to, index }) =>
      Decoration.inline(from, to, {
        nodeName: 'mark',
        class:
          index === activeIndex ? 'pdf-search-match pdf-search-match-active' : 'pdf-search-match',
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
            const isNewSearch = tr.docChanged || keyword !== previous.keyword
            const { ranges, matchPages, totalMatches } = isNewSearch
              ? findMatches(newState.doc, keyword)
              : previous
            const activeIndex =
              meta?.activeIndex ??
              (isNewSearch ? (totalMatches > 0 ? 0 : -1) : previous.activeIndex)

            return {
              keyword,
              activeIndex,
              totalMatches,
              ranges,
              matchPages,
              decorations: buildDecorations(newState.doc, ranges, activeIndex),
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
