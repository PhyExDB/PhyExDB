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

const [parent, items] = useDragAndDrop([...values], {
  group: group,
  // Triggers when the user reorders elements; emits the new state to the parent component
  onSort: () => {
    nextTick(() => emit("update:values", [...items.value]))
  },
})

// Watch for changes in the `values` prop and update `items`
watch(
  () => values.map(v => v.id).join(","),
  (newIds) => {
    const currentIds = items.value.map(i => i.id).join(",")
    if (currentIds !== newIds) {
      items.value = [...values]
    }
  },
  { immediate: true },
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
