<template>
  <ListboxVirtualizer
    v-slot="{ option }"
    v-bind="forwarded"
    :class="styles({ class: props.class })"
  >
    <slot :option="option" />
  </ListboxVirtualizer>
</template>

<script lang="ts" setup>
/* eslint-disable @typescript-eslint/no-explicit-any */
import { cva } from "class-variance-authority"
import { ListboxVirtualizer, useForwardProps } from "radix-vue"
import type { ListboxVirtualizerProps } from "radix-vue"

const props = defineProps<ListboxVirtualizerProps & { class?: any }>()
const forwarded = useForwardProps(reactiveOmit(props, "class"))

const styles = cva("")
</script>
