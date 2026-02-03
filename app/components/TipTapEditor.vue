<script setup lang="ts">
import type { Level } from "@tiptap/extension-heading"
import type { FileDetail } from "~~/shared/types"
import { Subscript as TiptapSubscript } from "@tiptap/extension-subscript"
import { Superscript as TiptapSuperscript } from "@tiptap/extension-superscript"
import TiptapImage from "@tiptap/extension-image"
import Mathematics from "@tiptap/extension-mathematics"
import { PlainTextPaste } from "./PlainTextPaste"

import "katex/dist/katex.min.css"

const { modelValue, showHeadings, editorClass } = defineProps({
  modelValue: {
    type: String,
    required: false,
    default: "",
  },
  showHeadings: {
    type: Boolean,
    required: false,
    default: true,
  },
  editorClass: {
    type: String,
    required: false,
    default: "h-96 overflow-auto",
  }
})

// Emit event for two-way binding
const emit = defineEmits(["update:modelValue"])

const { files, handleFileInput } = useFileStorage()

async function uploadImage() {
  const input = document.createElement("input")
  input.type = "file"
  input.accept = "image/*"
  input.onchange = async (event: any) => {
    const file = event.target.files[0]
    if (!file) return

    await handleFileInput(event)

    try {
      const response = await $fetch<FileDetail[]>("/api/files", {
        method: "POST",
        body: {
          files: files.value,
        },
      })

      if (response && response.length > 0) {
        const uploadedFile = response[0]
        if (uploadedFile) {
          attachments.value.push(uploadedFile.path)
        }
      }
    } catch (error) {
      console.error("Image upload failed", error)
    } finally {
      files.value = []
    }
  }
  input.click()
}

// Editor initialization
const editorExtensions = [
  TiptapStarterKit.configure({
    heading: showHeadings ? { levels: [1, 2, 3] } : false,
    codeBlock: false,
    hardBreak: false,
    horizontalRule: false,
    blockquote: false,
  }),
  TiptapLink.configure({
    openOnClick: false,
    defaultProtocol: "https",
  }),
  TiptapSubscript.configure({}),
  TiptapSuperscript.configure({}),
  Mathematics.configure({
    shouldRender: (state, pos, node) => {
      const $pos = state.doc.resolve(pos)
      return node.type.name === "text" && $pos.parent.type.name !== "codeBlock"
    },
  }),
  PlainTextPaste,
]

const editor = useEditor({
  content: modelValue,
  extensions: editorExtensions,
})

const attachments = ref<string[]>([])
const selectedImage = ref<string | null>(null)

function removeAttachment(index: number) {
  attachments.value.splice(index, 1)
}

function openLightbox(src: string) {
  selectedImage.value = src
}

const linkUrl = ref("")
const isLinkDropdownOpen = ref(false)

const headings = [
  { level: 1, label: "H1" },
  { level: 2, label: "H2" },
  { level: 3, label: "H3" },
] as { level: Level, label: string }[]

function setLinkValue() {
  linkUrl.value = editor.value?.getAttributes("link")?.href || ""
}

function closeLinkDropdown() {
  isLinkDropdownOpen.value = false
}

function setNewLink() {
  // Cancelled
  if (linkUrl.value === null) {
    closeLinkDropdown()
    return
  }

  // Empty
  if (linkUrl.value === "") {
    editor.value?.chain().focus().extendMarkRange("link").unsetLink().run()
    closeLinkDropdown()
    return
  }

  const linkValueWithProtocol = linkUrl.value.startsWith("http") ? linkUrl.value : `https://${linkUrl.value}`

  // Update the Link
  editor.value?.chain().focus().extendMarkRange("link").setLink({ href: linkValueWithProtocol }).run()
  closeLinkDropdown()
}

// Watch the editor content and emit changes
watch(
  [() => editor.value?.getHTML(), attachments],
  ([newContent, newAttachments]) => {
    let finalContent = newContent || ""
    if (newAttachments.length > 0) {
      const imagesHtml = newAttachments.map(src => `<img src="${src}" class="editor-attachment" />`).join("")
      finalContent += `<div class="attachments-container">${imagesHtml}</div>`
    }
    emit("update:modelValue", finalContent)
  },
  { deep: true }
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})

function insertMathFormula() {
  editor.value?.chain().focus().insertContent("$E = mc^2$").run()
}
</script>

<template>
  <div v-if="editor">
    <div class="max-w-4xl mx-auto">
      <div class="border rounded-lg shadow-md overflow-hidden bg-background">
        <!-- Toolbar -->
        <div class="flex flex-wrap items-center gap-2 p-3 border-b bg-background">
          <!-- Text Formatting -->
          <div class="flex gap-1">
            <Button
              type="button"
              variant="outline"
              class="btn aspect-square"
              :class="{ 'btn-active': editor.isActive('bold') }"
              :disabled="!editor.can().chain().focus().toggleBold().run()"
              @click="editor.chain().focus().toggleBold().run()"
            >
              <strong>B</strong>
            </Button>
            <Button
              type="button"
              variant="outline"
              class="btn aspect-square"
              :class="{ 'btn-active': editor.isActive('italic') }"
              :disabled="!editor.can().chain().focus().toggleItalic().run()"
              @click="editor.chain().focus().toggleItalic().run()"
            >
              <em>I</em>
            </Button>
            <Button
              type="button"
              variant="outline"
              class="btn aspect-square"
              :class="{ 'btn-active': editor.isActive('strike') }"
              :disabled="!editor.can().chain().focus().toggleStrike().run()"
              @click="editor.chain().focus().toggleStrike().run()"
            >
              <s>S</s>
            </Button>
            <Button
              type="button"
              variant="outline"
              class="btn aspect-square"
              :class="{ 'btn-active': editor.isActive('subscript') }"
              :disabled="!editor.can().chain().focus().toggleSubscript().run()"
              @click="editor.chain().focus().toggleSubscript().run()"
            >
              <p>x<sub>2</sub></p>
            </Button>
            <Button
              type="button"
              variant="outline"
              class="btn aspect-square"
              :class="{ 'btn-active': editor.isActive('superscript') }"
              :disabled="!editor.can().chain().focus().toggleSuperscript().run()"
              @click="editor.chain().focus().toggleSuperscript().run()"
            >
              <p>x<sup>2</sup></p>
            </Button>
            <DropdownMenu v-model:open="isLinkDropdownOpen">
              <DropdownMenuTrigger as-child>
                <Button
                  type="button"
                  variant="outline"
                  class="btn aspect-square"
                  :class="{ 'btn-active': editor.isActive('link') }"
                  :disabled="!editor.can().chain().focus().toggleLink({ href: '' }).run()"
                  @click="setLinkValue"
                >
                  <Icon name="heroicons:link" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-64 p-2">
                <DropdownMenuLabel>Link</DropdownMenuLabel>
                <Input
                  v-model="linkUrl"
                  placeholder="https://example.com"
                  class="w-full"
                />
                <div class="flex gap-1 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    class="ml-auto"
                    @click="setNewLink"
                  >
                    Speichern
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              type="button"
              variant="outline"
              class="btn aspect-square"
              :class="{ 'btn-active': editor.isActive('link') }"
              :disabled="!editor.can().chain().focus().unsetLink().run()"
              @click="editor.chain().focus().unsetLink().run()"
            >
              <Icon name="heroicons:link-slash" />
            </Button>
            <Button
              type="button"
              variant="outline"
              class="btn aspect-square"
              @click="uploadImage"
            >
              <Icon name="heroicons:photo" />
            </Button>
          </div>

          <!-- Headings -->
          <div
            v-if="showHeadings"
            class="flex gap-1"
          >
            <template
              v-for="heading in headings"
              :key="heading.level"
            >
              <Button
                type="button"
                variant="outline"
                class="btn aspect-square"
                :class="{ 'btn-active': editor.isActive('heading', { level: heading.level }) }"
                @click="editor.chain().focus().toggleHeading({ level: heading.level }).run()"
              >
                {{ heading.label }}
              </Button>
            </template>
          </div>

          <!-- Lists -->
          <div class="flex gap-1">
            <Button
              type="button"
              variant="outline"
              class="btn"
              :class="{ 'btn-active': editor.isActive('bulletList') }"
              @click="editor.chain().focus().toggleBulletList().run()"
            >
              • List
            </Button>
            <Button
              type="button"
              variant="outline"
              class="btn"
              :class="{ 'btn-active': editor.isActive('orderedList') }"
              @click="editor.chain().focus().toggleOrderedList().run()"
            >
              1. List
            </Button>
          </div>

          <!-- LateX -->
          <Button
            type="button"
            variant="outline"
            class="btn"
            @click="insertMathFormula"
          >
            <span class="font-serif italic">∑</span> Math
          </Button>

          <!-- Undo/Redo -->
          <div class="flex gap-1 ml-auto">
            <Button
              type="button"
              variant="outline"
              class="btn"
              :disabled="!editor.can().chain().focus().undo().run()"
              @click="editor.chain().focus().undo().run()"
            >
              <Icon name="heroicons:arrow-uturn-left" />
              Undo
            </Button>
            <Button
              type="button"
              variant="outline"
              class="btn"
              :disabled="!editor.can().chain().focus().redo().run()"
              @click="editor.chain().focus().redo().run()"
            >
              <Icon name="heroicons:arrow-uturn-right" />
              Redo
            </Button>
          </div>
        </div>

        <!-- Editor Content -->
        <div
            class="relative flex flex-col transition-all bg-background custom-resize-area rounded-b-lg"
            :class="editorClass"
            style="resize: vertical; min-height: 120px; max-height: 400px;"
        >
          <TiptapEditorContent
              :editor="editor"
              class="prose dark:prose-invert max-w-full p-4 flex-1 overflow-y-auto outline-none"
          />
        </div>

        <!-- Preview Area -->
        <div v-if="attachments.length > 0" class="p-3 border-t bg-muted/30 backdrop-blur-sm">
          <div class="flex flex-wrap gap-2">
            <div
                v-for="(src, index) in attachments"
                :key="src"
                class="relative group cursor-pointer"
            >
              <img
                  :src="src"
                  class="w-14 h-14 object-cover rounded-md border shadow-sm bg-background transition-transform duration-200 group-hover:scale-105"
                  @click="openLightbox(src)"
              >
              <button
                  type="button"
                  class="absolute -top-2 -right-2 flex items-center justify-center h-5 w-5 bg-destructive text-destructive-foreground rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity p-0 border-none"
                  @click.stop="removeAttachment(index)"
              >
                <Icon name="heroicons:x-mark" class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox Dialog -->
    <Dialog :open="!!selectedImage" @update:open="selectedImage = null">
      <DialogContent class="max-w-[90vw] max-h-[90vh] p-0 border-none bg-transparent shadow-none flex items-center justify-center">
        <img
          v-if="selectedImage"
          :src="selectedImage"
          class="max-w-full max-h-full object-contain rounded-lg"
          @click="selectedImage = null"
        >
      </DialogContent>
    </Dialog>
  </div>
</template>

<style>
.btn {
  @apply px-2 py-1 text-sm font-medium text-muted-foreground border rounded-md disabled:opacity-50;
}
.btn-active {
  @apply bg-accent text-accent-foreground;
}

.ProseMirror:focus {
    outline: none;
}

/* Custom Paragraph Spacing */
.prose p {
  @apply my-0; /* Reduce the default margin between paragraphs */
}
.prose li {
  @apply my-0; /* Reduce the default margin between list items */
}
.prose ul {
  @apply my-2; /* Add a margin to the left of unordered lists */
}

/* Attachments container for rendering */
.attachments-container {
  @apply flex flex-wrap gap-2 mt-4 pt-4 border-t;
}

.prose img.editor-attachment,
.prose img {
  @apply inline-block rounded-md border bg-muted/30 p-1 transition-all !important;
  width: 100px !important;
  height: 100px !important;
  object-fit: cover;
  cursor: zoom-in;
}

.prose img:hover {
  @apply border-primary scale-105 shadow-md;
}

.ProseMirror img {
  display: none !important;
}

.custom-resize-area::-webkit-resizer {
  display: none;
  background-color: transparent;
}

.border.rounded-lg.overflow-hidden {
   @apply border-separate;
 }

.border-b.bg-background {
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
}

.custom-resize-area {
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
}

.p-3.border-t.bg-muted\/30 {
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
}
</style>
