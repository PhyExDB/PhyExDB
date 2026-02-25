<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { AvatarRoot } from "radix-vue"
import { avatarVariant, type AvatarVariants } from "."
import { cn } from "@/utils/utils"

const props = withDefaults(defineProps<{
  class?: HTMLAttributes["class"]
  size?: AvatarVariants["size"]
  shape?: AvatarVariants["shape"]
  react?: boolean
}>(), {
  size: "sm",
  shape: "circle",
  react: false,
})
</script>

<template>
  <AvatarRoot
    :class="cn(avatarVariant({
      size: props.size,
      shape: props.shape,
      react: props.react,
    }), props.class)"
    v-bind="$attrs"
  >
    <slot />
  </AvatarRoot>
</template>
