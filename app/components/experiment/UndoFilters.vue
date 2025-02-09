<script lang="ts" setup>
const { checked } = defineProps<{
  checked: string[][]
}>()

const emit = defineEmits<{
  (event: "update:checked", value: string[][]): void
}>()

function resetModelValues() {
  emit("update:checked", checked.map(() => []))
}
</script>

<template>
  <Button
    @click="resetModelValues"
  >
    Zurücksetzen
    <Icon
      name="heroicons:arrow-uturn-left"
      class="ml-2 h-4 w-4"
    />
  </Button>
</template>
