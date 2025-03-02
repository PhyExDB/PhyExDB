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
    :name="`heroicons:star${state === 'selected' ? '-solid' : ''}`"
    class="w-8 h-8"
    :class="{ 'bg-yellow-500': state === 'hover' || state === 'selected' }"
    @click="emit('click')"
    @mouseover="emit('hover')"
    @mouseleave="emit('end-hover')"
  />
</template>
