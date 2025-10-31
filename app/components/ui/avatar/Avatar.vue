<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { AvatarRoot } from "radix-vue"
import { avatarVariant, type AvatarVariants } from "."
import { cn } from "@/utils/utils"

const props = withDefaults(defineProps<{
  class?: HTMLAttributes["class"]
  size?: AvatarVariants["size"]
  shape?: AvatarVariants["shape"]
}>(), {
  size: "sm",
  shape: "circle",
})
</script>

<template>
  <AvatarRoot :class="cn(avatarVariant({ size, shape }), props.class, 'avatar-hover')">
    <slot />
  </AvatarRoot>
</template>

<style scoped>
.avatar-hover {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.avatar-hover:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>