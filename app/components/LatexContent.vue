<script setup lang="ts">
import 'katex/dist/katex.min.css'

const props = defineProps<{
  content: string
}>()

const { renderLatex } = useLatexRenderer()

const renderedContent = computed(() => {
  return renderLatex(props.content)
})
</script>

<template>
  <div
      class="prose dark:prose-invert max-w-full latex-content"
      v-html="renderedContent"
  />
</template>

<style>
.dark .latex-content {
  color: inherit;
}

.latex-content {
  margin:  1rem 0;
  overflow-x: auto;
  overflow-y: hidden;
}
</style>