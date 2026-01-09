<template>
  <div class="flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-sm">
    <div :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-full', colorClass]">
      <Icon
        :name="icon"
        class="h-6 w-6"
      />
    </div>
    <div>
      <p class="text-sm font-semibold">
        {{ title }}
      </p>
      <p class="text-xs text-muted-foreground">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  icon: string
  colorClass: string
}>()
</script>
