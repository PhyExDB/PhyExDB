<script setup lang="ts">
const { state } = defineProps<{
  state: "unselected" | "selected" | "hover"
}>()

const emit = defineEmits<{
  (e: "click" | "hover" | "end-hover"): void
}>()
</script>

<template>
  <Icon
      :name="state === 'selected' ? 'heroicons:star-20-solid' : 'heroicons:star'"
      class="w-8! h-8! transition-colors cursor-pointer"
      :class="state !== 'unselected' ? 'text-yellow-500' : 'text-gray-300'"
      @click="emit('click')"
      @mouseover="emit('hover')"
      @mouseleave="emit('end-hover')"
  />
</template>
