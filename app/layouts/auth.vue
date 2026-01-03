<script setup lang="ts">
import Toaster from "@/components/ui/toast/Toaster.vue"
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Main Content -->
    <main class="flex grow mx-auto py-6 items-center justify-center">
      <NuxtPage />
    </main>

    <WebsiteFooter />
    <Toaster />
  </div>
</template>
