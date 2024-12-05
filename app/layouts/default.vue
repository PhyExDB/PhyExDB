<template>
  <div class="min-h-screen flex flex-col">
    <div class="border-b">
      <div class="flex h-16 items-center ">
        <NavigationHeader class="mx-6" />
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-grow container mx-auto px-6 py-6">
      <NuxtPage />
    </main>

    <WebsiteFooter />
  </div>
</template>

<script setup>
</script>
