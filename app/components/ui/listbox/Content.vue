<template>
  <ListboxContent
    v-bind="forwarded"
    :class="styles({ class: props.class })"
  >
    <slot />
  </ListboxContent>
</template>

<script lang="ts" setup>
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ListboxContent, useForwardProps } from "radix-vue"
import type { ListboxContentProps } from "radix-vue"
import { cva } from "class-variance-authority"

const props = defineProps<ListboxContentProps & { class?: any }>()
const forwarded = useForwardProps(reactiveOmit(props))

const styles = cva(
  "max-h-[300px] w-full overflow-y-auto rounded-md border bg-popover px-4 py-2",
)
</script>
