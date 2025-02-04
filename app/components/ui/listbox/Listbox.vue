<template>
  <ListboxRoot
    v-slot="{ modelValue }"
    v-bind="forwarded"
    :class="styles({ class: props.class })"
  >
    <slot :model-value="modelValue" />
  </ListboxRoot>
</template>

<script lang="ts" setup>
/* eslint-disable @typescript-eslint/no-explicit-any */
import { cva } from "class-variance-authority"
import { ListboxRoot, useForwardPropsEmits } from "radix-vue"
import type { ListboxRootEmits, ListboxRootProps } from "radix-vue"

const props = defineProps<ListboxRootProps & { class?: any }>()
const emits = defineEmits<ListboxRootEmits>()
const forwarded = useForwardPropsEmits(reactiveOmit(props, "class"), emits)

const styles = cva(
  "relative flex flex-col gap-4",
)
</script>
