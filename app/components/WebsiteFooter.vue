<script lang="ts" setup>
const currentYear = new Date().getFullYear()
const runtimeConfig = useRuntimeConfig()
const appName = runtimeConfig.public.appName
</script>

<template>
  <footer class="bg-muted text-muted-foreground">
    <div class="container mx-auto px-4 py-4 text-sm flex flex-col md:flex-row justify-between items-center">
      <p class="order-last md:order-1 mb-4 md:mb-0 pt-5 md:pt-0">
        &copy; {{ currentYear }} {{ appName }}
      </p>
      <ul class="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-center order-1 md:order-last">
        <li>
          <NuxtLink
            to="/legal/terms-of-service"
            class="hover:text-foreground flex items-center transition-colors"
          >
            Nutzungsbedingungen
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/legal/imprint"
            class="hover:text-foreground flex items-center transition-colors"
          >
            Impressum
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/legal/privacy-policy"
            class="hover:text-foreground flex items-center transition-colors"
          >
            Datenschutzerklärung
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            href="https://github.com/PhyExDB/PhyExDB"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-foreground flex items-center transition-colors"
          >
            <Icon
              name="uil:github"
              class="w-6 h-6"
            />
          </NuxtLink>
        </li>
      </ul>
    </div>
  </footer>
</template>
