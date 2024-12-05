<script lang="ts" setup>
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-muted text-muted-foreground">
    <div class="container mx-auto px-4 py-4 text-sm flex justify-between items-center">
      <p>&copy; {{ currentYear }} PhyExDB</p>
      <ul class="flex space-x-4 items-center">
        <li>
          <NuxtLink
            to="/terms-of-service"
            class="hover:text-foreground flex items-center transition-colors"
          >
            Nutzungsbedingungen
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/imprint"
            class="hover:text-foreground flex items-center transition-colors"
          >
            Impressum
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/privacy-policy"
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
