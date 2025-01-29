<script lang="ts" setup>
const { checked, attributes, showUndoButton } = defineProps<{
  checked: string[][]
  attributes: ExperimentAttributeDetail[] | undefined
  showUndoButton: boolean
}>()

const emit = defineEmits<{
  (event: "update:checked", value: string[][]): void
}>()

function updateModelValue(value: string[][]) {
  emit("update:checked", value)
}

function updateModelValueAtIndex(index: number, value: string[]) {
  const newChecked = checked.slice()
  newChecked[index] = value
  updateModelValue(newChecked)
}
</script>

<template>
  <template
    v-for="(attribute, attributeIndex) in attributes"
    :key="attribute.id"
  >
    <div class="w-full flex flex-col justify-between h-full">
      <Label class="mb-2">{{ attribute.name }}</Label>
      <div class="mt-auto">
        <MultiSelect
          :options="attribute.values"
          search-placeholder="Suche..."
          :multiple="attribute.multipleSelection"
          :model-value="checked[attributeIndex]"
          :value-for-option="option => option.value"
          @update:model-value="updateModelValueAtIndex(attributeIndex, $event)"
        >
          <template #empty>
            Keine Optionen gefunden.
          </template>
          <template #preview="{ selected }">
            {{ selected.length ? selected.map(id => attribute.values.find(value => value.id === id)?.value).join(", ") : "Alle" }}
          </template>
          <template #option="{ option }">
            {{ option.value }}
          </template>
        </MultiSelect>
      </div>
    </div>
  </template>
  <template
    v-if="showUndoButton"
  >
    <div class="w-full flex flex-col h-full justify-end">
      <ExperimentsUndoFilters
        :checked="checked"
        @update:checked="updateModelValue"
      />
    </div>
  </template>
</template>
