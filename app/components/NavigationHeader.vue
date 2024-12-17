<script setup lang="ts">
</script>

<template>
  <nav
    :class="cn('flex items-center space-x-2 lg:space-x-4 w-full', $attrs.class ?? '')"
  >
    <NuxtLink
      href="/"
      class="text-sm font-medium transition-colors hover:text-primary"
    >
      Logo / Home
    </NuxtLink>
    <!-- Spacer -->
    <div class="flex-grow" />
    <NavigationSearch />
    <ColorModeButton />
    <!-- Add user dropdown here and put in separate component -->
    <AuthControl />
  </nav>
</template>
