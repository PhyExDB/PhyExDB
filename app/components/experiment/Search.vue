<script setup lang="ts">
import { Input } from "@/components/ui/input"

const { search } = defineProps<{
  search: string
}>()

const emit = defineEmits<{
  (event: "update:search", value: string): void
}>()

function update(value: string) {
  emit("update:search", value)
}
</script>

<template>
  <div class="relative items-center">
    <Input
      id="search"
      :model-value="search"
      type="text"
      placeholder="Suchen..."
      class="pl-10"
      @input="update($event.target.value)"
    />
    <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
      <Icon
        name="heroicons:magnifying-glass"
        class="w-5! h-5! text-muted-foreground"
      />
    </span>
    <button
      type="button"
      class="absolute end-0 inset-y-0 flex items-center justify-center px-3"
      @click="update('')"
    >
      <Icon
        name="heroicons:x-mark"
        class="w-5! h-5! text-muted-foreground"
      />
    </button>
  </div>
</template>
