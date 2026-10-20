import { Extension, type Editor } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

// 1-based page to show; null shows every page
const pageVisibilityKey = new PluginKey<number | null>('pageVisibility')

/** Shows only `visiblePage`, or every page when it is null. */
export const setVisiblePage = (editor: Editor, visiblePage: number | null) => {
  editor.view.dispatch(editor.state.tr.setMeta(pageVisibilityKey, visiblePage))
}

/**
 * Hides pages with decorations instead of removing them, so search still runs
 * over the whole document and match indexes stay the same.
 */
export const PageVisibility = Extension.create({
  name: 'pageVisibility',

  addProseMirrorPlugins() {
    return [
      new Plugin<number | null>({
        key: pageVisibilityKey,
        state: {
          init: () => null,
          apply: (tr, previous) => {
            const meta = tr.getMeta(pageVisibilityKey) as number | null | undefined
            return meta === undefined ? previous : meta
          },
        },
        props: {
          decorations: (state) => {
            const visiblePage = pageVisibilityKey.getState(state)
            if (visiblePage == null) return DecorationSet.empty

            const decorations: Decoration[] = []
            state.doc.forEach((page, offset, index) => {
              if (index + 1 !== visiblePage) {
                decorations.push(
                  Decoration.node(offset, offset + page.nodeSize, { class: 'hidden' })
                )
              }
            })
            return DecorationSet.create(state.doc, decorations)
          },
        },
      }),
    ]
  },
})
