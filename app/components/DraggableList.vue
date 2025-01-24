<script lang="ts" generic="T extends { id: string }" setup>
import { useDragAndDrop } from "@formkit/drag-and-drop/vue"

const { values } = defineProps({
  values: {
    type: Array<T>,
    required: true,
  },
})

const emit = defineEmits<{
  (e: "update:values", value: T[]): void
}>()

const [parent, items] = useDragAndDrop(values)

// Watch for changes in the `values` prop and update `items`
watch(
  () => values,
  (newValues) => {
    items.value = [...newValues] // Sync `items` with the prop values
  },
  { deep: true, immediate: true },
)

// Watch for changes in the `items` array and emit an event when the order changes
watch(
  items,
  (newItems) => {
    emit("update:values", [...newItems]) // Notify the parent of the updated order
  },
  { deep: true },
)
</script>

<template>
  <div
    ref="parent"
    class="item-list"
  >
    <template
      v-for="item in items"
      :key="item.id"
    >
      <slot
        name="item"
        :item="item"
      />
    </template>
  </div>
</template>
