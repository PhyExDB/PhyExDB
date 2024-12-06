<script setup lang="ts">
import { Input } from "@/components/ui/input"
</script>

<template>
  <div class="relative w-full max-w-sm items-center">
    <Input
      id="search"
      type="text"
      placeholder="Suchen..."
      class="pl-10"
    />
    <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
      <Icon
        name="heroicons:magnifying-glass"
        class="w-5 h-5 text-muted-foreground"
      />
    </span>
  </div>
</template>
