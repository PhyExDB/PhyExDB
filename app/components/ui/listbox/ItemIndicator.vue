<template>
  <ListboxItemIndicator v-bind="forwarded">
    <slot>
      <Icon
        :class="styles({ class: props.class })"
        :name="icon || 'lucide:circle-check'"
      />
    </slot>
  </ListboxItemIndicator>
</template>

<script lang="ts" setup>
/* eslint-disable @typescript-eslint/no-explicit-any */
import { cva } from "class-variance-authority"
import { ListboxItemIndicator, useForwardPropsEmits } from "radix-vue"
import type { ListboxItemIndicatorProps } from "radix-vue"

const props = defineProps<ListboxItemIndicatorProps & { class?: any, icon?: string }>()
const forwarded = useForwardPropsEmits(reactiveOmit(props, "class"))

const styles = cva(
  "size-5 shrink-0",
)
</script>
