<script setup lang="ts">
</script>

<template>
  <nav
    :class="cn('flex items-center space-x-2 lg:space-x-4 w-full', $attrs.class ?? '')"
  >
    <NuxtLink
      href="/"
      class="text-xl font-medium transition-colors hover:text-primary"
    >
      <div class="flex flex-row items-center space-x-2">
        <NuxtImg
          src="/Logo.png"
          alt="Logo"
          width="40"
          height="40"
        />
        <p>
          <span class="font-bold">PhyEx</span><span class="text-accent">DB</span>
        </p>
      </div>
    </NuxtLink>
    <!-- Spacer -->
    <NuxtLink
      href="/experiments"
    >
      <Button
        variant="link"
        class="text-muted-foreground hidden sm:block"
      >
        Versuche entdecken
      </Button>
    </NuxtLink>
    <div class="flex-grow" />
    <ColorModeButton />
    <!-- Add user dropdown here and put in separate component -->
    <AuthControl />
  </nav>
</template>
