<script setup lang="ts">
import type { NuxtError } from "#app"

const props = defineProps({
  error: Object as () => NuxtError,
})

if (props.error?.statusCode === 401) {
  navigateToWithRedirect("/login")
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="flex flex-col items-center space-y-4">
      <h1 class="text-4xl">
        Etwas ist schiefgelaufen...
      </h1>
      <div v-if="props.error?.statusCode">
        <div class="flex text-xl text-gray-400">
          <p>
            Fehler {{ props.error.statusCode }}
          </p>
          <p
            v-if="props.error.message != null && props.error.message.length > 0"
          >
            : {{ props.error.message }}
          </p>
        </div>
      </div>
      <NuxtLink to="/login">
        <Button
          v-if="props.error?.statusCode === 401"
        >
          Anmelden
        </Button>
      </NuxtLink>
      <NuxtLink to="/">
        <Button>
          Zurück zur Startseite
        </Button>
      </NuxtLink>
    </div>
  </div>
</template>
