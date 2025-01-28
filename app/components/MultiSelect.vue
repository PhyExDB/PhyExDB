<script lang="ts" generic="T extends { id: string }" setup>
const { modelValue, options, multiple } = defineProps({
  modelValue: {
    type: Array<string>,
    required: false,
    default: () => [],
  },
  options: {
    type: Array<T>,
    required: true,
  },
  searchPlaceholder: {
    type: String,
    required: false,
    default: "Search options",
  },
  multiple: {
    type: Boolean,
    required: false,
    default: false,
  },
  valueForOption: {
    type: Function as PropType<(option: T) => string>,
    required: false,
    default: (option: T) => option.id,
  },
})

const emit = defineEmits<{
  (e: "update:modelValue", value: string[]): void
}>()

const open = ref(false)
const selected = ref<string[]>(modelValue)

const isSelected = (option: T) => selected.value.includes(option.id)

const toggle = (option: T) => {
  if (multiple) {
    if (isSelected(option)) {
      selected.value = selected.value.filter(id => id !== option.id)
    } else {
      selected.value = [...selected.value, option.id]
    }
  } else {
    selected.value = [option.id]
    open.value = false
  }

  emit("update:modelValue", selected.value)
}
</script>

<template>
  <Popover
    v-model:open="open"
  >
    <PopoverTrigger
      as-child
      class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:truncate text-start"
    >
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        class="justify-between"
      >
        <slot
          name="preview"
          :selected="selected"
        >
          Select options
        </slot>
        <Icon
          name="heroicons:chevron-up-down"
          class="ml-2 h-4 w-4 shrink-0 opacity-50"
        />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="p-0">
      <Command>
        <CommandInput
          class="h-9"
          :placeholder="searchPlaceholder"
        />
        <CommandEmpty>
          <slot name="empty">
            No options found.
          </slot>
        </CommandEmpty>
        <CommandList>
          <CommandGroup>
            <CommandItem
              v-for="option in options"
              :key="option.id"
              :value="valueForOption(option)"
              @select="toggle(option)"
            >
              <slot
                name="option"
                :option="option"
              >
                {{ option.id }}
              </slot>
              <Icon
                v-if="isSelected(option)"
                name="heroicons:check"
                class="ml-auto h-4 w-4"
              />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
