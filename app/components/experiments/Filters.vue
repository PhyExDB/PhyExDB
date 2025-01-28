<template>
  <div
    v-for="(attribute, attributeIndex) in attributes"
    :key="attribute.id"
  >
    <DropdownMenu>
      <DropdownMenuTrigger
        as-child
      >
        <Button
          variant="outline"
          :class="{ 'border-success-foreground': checked[attributeIndex]!.some(checked => checked) }"
        >
          {{ attribute.name }}
          <Icon
            name="heroicons:chevron-down"
            class="ml-2 h-4 w-4"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        sticky="always"
        class="w-56"
      >
        <DropdownMenuCheckboxItem
          v-for="(attributeValue, valueIndex) in attribute.values"
          :key="attributeValue.id"
          v-model:checked="checked[attributeIndex]![valueIndex]"
          :disabled="singleChoiceAttributes.includes(attribute.name)
            && checked[attributeIndex]!.some(
              (isChecked, idx) => isChecked && idx !== valueIndex,
            )"
          @click.stop
        >
          {{ attributeValue.value }}
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
  <div
    v-if="showUndoButton"
  >
    <ExperimentsUndoFilters
      :checked="checked"
    />
  </div>
</template>

<script lang="ts" setup>
const { checked, attributes, singleChoiceAttributes, showUndoButton } = defineProps<{
  checked: boolean[][]
  attributes: ExperimentAttributeDetail[] | undefined
  singleChoiceAttributes: string[]
  showUndoButton: boolean
}>()
</script>

<style>

</style>
