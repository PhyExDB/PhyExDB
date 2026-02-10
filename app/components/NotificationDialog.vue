<script lang="ts" setup>
defineProps<{
  open: boolean
  iconName: string
  title: string
  description?: string
  accentClass?: string
}>()

const emit = defineEmits(["update:open", "close"])
</script>

<template>
  <Dialog
    :open="open"
    @update:open="val => emit('update:open', val)"
  >
    <DialogContent class="sm:max-w-[400px] overflow-hidden p-0 border-border shadow-xl">
      <div :class="['h-1.5 w-full', accentClass || 'bg-primary']" />

      <div class="p-8">
        <DialogHeader>
          <div class="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Icon
              :name="iconName"
              class="w-7 h-7 text-primary"
            />
          </div>
          <DialogTitle class="text-center text-2xl font-bold tracking-tight">
            {{ title }}
          </DialogTitle>
          <DialogDescription
            v-if="description"
            class="text-center text-muted-foreground pt-1"
          >
            {{ description }}
          </DialogDescription>
        </DialogHeader>

        <div class="mt-8">
          <slot />
        </div>

        <div class="mt-8">
          <slot name="footer" />
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
