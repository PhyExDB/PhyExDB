<script setup lang="ts">
import Toaster from "@/components/ui/toast/Toaster.vue"
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <div class="border-b">
      <div class="flex container h-16 items-center">
        <NavigationHeader />
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-grow container mx-auto py-6">
      <NuxtPage />
    </main>

    <WebsiteFooter />
    <Toaster />
    <NotificationPopups />
  </div>
</template>
