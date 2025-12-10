/**
 * PlainTextPaste Extension
 * ------------------------
 * This TipTap overrides the default overrides the default paste behavior so that
 * all pasted content is converted to plain text.
 *
 * Removes common markdown-like formatting inject into the "text/plain" clipboard content
 *
 * Ensures pasted content is inserted as plain text with common markdown stripped.
 */
import { Extension } from "@tiptap/core"
import { Plugin } from "prosemirror-state"
import type { EditorView } from "prosemirror-view"

export const PlainTextPaste = Extension.create({
  name: "plainTextPaste",

  /**
   * addProseMirrorPlugins()
   * -----------------------
   * TipTap method used to inject custom ProseMirror plugins.
   *
   * @returns Array<Plugin>
   *
   * Returns one plugin containing a custom
   * 'handlePaste' function that interprets all paste events.
   */
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          /**
           * Sanitizing markdown-like formatting inserted by other apps
           * @param view the active ProseMirror editor view
           * @param event the ClipboardEvent triggered by CTRL+V/Cmd+V
           * @returns boolean indicating whether we handled the paste
           */
          handlePaste(view: EditorView, event: ClipboardEvent) {
            // Extract raw plaintext. If none exists, allow default behavior.
            let text = event.clipboardData?.getData("text/plain") ?? ""
            if (!text) return false

            // Prevent TipTap from pasting formatted content
            event.preventDefault()

            text = text
              // **bold**
              .replace(/\*\*(.*?)\*\*/g, "$1")
              // *italic*
              .replace(/(^|\W)\*(\S(.*?\S)?)\*(\W|$)/g, "$1$2$4")
              // # headings
              .replace(/^#+\s+/gm, "")
              // bullet markers
              .replace(/^\s*[-•]\s+/gm, "")
              // numbered lists
              .replace(/^\s*\d+\.\s+/gm, "")
              // markdown links
              .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")

            const { state, dispatch } = view
            // Preserving line breaks
            const paragraphs = text.split(/\r?\n/)
            const tr = state.tr

            paragraphs.forEach((line, index) => {
              if (index > 0) {
                tr.split(tr.selection.to)
              }
              tr.insertText(line)
            })

            dispatch(tr)
            return true
          },
        },
      }),
    ]
  },
})
