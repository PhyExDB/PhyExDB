<script setup lang="ts">
import type { Level } from "@tiptap/extension-heading"
import { Subscript as TiptapSubscript } from "@tiptap/extension-subscript"
import { Superscript as TiptapSuperscript } from "@tiptap/extension-superscript"
import { PlainTextPaste } from "./PlainTextPaste"

const { modelValue, showHeadings } = defineProps({
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
  },
})

// Emit event for two-way binding
const emit = defineEmits(["update:modelValue"])

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
  PlainTextPaste,
]
const editor = useEditor({
  content: modelValue,
  extensions: editorExtensions,
})

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
  () => editor.value?.getHTML(),
  (newContent) => {
    emit("update:modelValue", newContent)
  },
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div v-if="editor">
    <div class="max-w-4xl mx-auto">
      <div class="border rounded-lg shadow-md">
        <!-- Toolbar -->
        <div class="flex flex-wrap items-center gap-2 p-3 border-b">
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
          class="p-4"
          :class="editorClass"
        >
          <TiptapEditorContent
            :editor="editor"
            class="prose dark:prose-invert max-w-full"
          />
        </div>
      </div>
    </div>
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
</style>
