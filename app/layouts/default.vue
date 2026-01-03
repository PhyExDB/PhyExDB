<script setup lang="ts">
import Toaster from "@/components/ui/toast/Toaster.vue"
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <div class="border-b">
      <div class="flex container h-16 items-center @container">
        <NavigationHeader />
      </div>
    </div>

    <!-- Main Content -->
    <main class="grow container mx-auto py-6 @container">
      <NuxtPage />
    </main>

    <WebsiteFooter />
    <Toaster />
  </div>
</template>
