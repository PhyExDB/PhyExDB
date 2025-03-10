<script lang="ts" generic="T extends { id: string }" setup>
import { useDragAndDrop } from "@formkit/drag-and-drop/vue"

const { values, group } = defineProps({
  values: {
    type: Array<T>,
    required: true,
  },
  group: {
    type: String,
    default: undefined,
  },
})

const emit = defineEmits<{
  (e: "update:values", value: T[]): void
}>()

const [parent, items] = useDragAndDrop(values, { group: group })

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
    class="grid gap-4"
  >
    <template
      v-for="(item, index) in items"
      :key="item.id"
    >
      <slot
        name="item"
        :item="item"
        :index="index"
      />
    </template>
    <slot
      v-if="items.length === 0"
      name="empty-list"
    />
  </div>
</template>
