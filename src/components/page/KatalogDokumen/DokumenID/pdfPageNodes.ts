import { Node, mergeAttributes } from '@tiptap/core'
import { Document } from '@tiptap/extension-document'
import type { RecordViewPage } from '@/services/recordView.svc'

// An A4 sheet (96 DPI) that grows with its content, and one frame in normal flow
// instead of the converter's absolute positioning
const PAGE_STYLE = 'width: 794px; min-height: 1123px'
const FRAME_STYLE = 'position: relative; padding: 72px; font-size: 14px; line-height: 1.6'

// The record view API's `contentEditor` is plain HTML; wrap it in the page/frame
// nodes below so each API item becomes one viewer page
export const toPageHtml = ({ pageNumber, contentEditor }: RecordViewPage) =>
  `<div data-type="page" data-page="${pageNumber}" style="${PAGE_STYLE}"><div data-type="frame" style="${FRAME_STYLE}">${contentEditor}</div></div>`

// Keep the converter's inline style (position, size, font) exactly as written
const rawStyle = {
  default: null,
  parseHTML: (el: HTMLElement) => el.getAttribute('style'),
  renderHTML: (attrs: Record<string, unknown>) => (attrs.style ? { style: attrs.style } : {}),
}

/**
 * One PDF page from the record view API (`contentEditor`):
 * `<div data-type="page" data-page="1" style="position: relative; width: …; height: …">`.
 */
export const PageNode = Node.create({
  name: 'page',
  group: 'page',
  content: 'frame*',
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      pageNumber: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-page'),
        renderHTML: (attrs) => (attrs.pageNumber ? { 'data-page': attrs.pageNumber } : {}),
      },
      style: rawStyle,
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="page"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'page' }), 0]
  },
})

/**
 * One block placed at its exact position on the page:
 * `<div data-type="frame" style="position: absolute; left: …; top: …; width: …">`.
 */
export const FrameNode = Node.create({
  name: 'frame',
  group: 'frame',
  content: 'block+',
  defining: true,
  isolating: true,

  addAttributes() {
    return { style: rawStyle }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="frame"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'frame' }), 0]
  },
})

// The document is a list of pages
export const PageDocument = Document.extend({
  content: 'page+',
})
