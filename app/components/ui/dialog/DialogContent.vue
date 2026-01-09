<script setup lang="ts">
import { X } from "lucide-vue-next"
import {
  DialogClose,
  DialogContent,
  type DialogContentEmits,
  type DialogContentProps,
  DialogOverlay,
  DialogPortal,
  useForwardPropsEmits,
} from "radix-vue"
import { computed, type HTMLAttributes } from "vue"
import { cn } from "@/utils/utils"

const props = defineProps<DialogContentProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<DialogContentEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <DialogPortal>
    <DialogOverlay
      class="fixed inset-0 z-50 bg-black/80
               data-[state=open]:animate-overlay-in
               data-[state=closed]:animate-fade-out"
    />
    <DialogContent
      v-bind="forwarded"
      :class="
        cn(
          'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-2xl sm:rounded-2xl',
          'data-[state=open]:animate-dialog-in',
          'data-[state=closed]:animate-dialog-out',
          'will-change-transform',
          props.class,
        )"
    >
      <slot />
      <DialogClose class="absolute right-4 top-4 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
        <X class="w-4 h-4" />
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
