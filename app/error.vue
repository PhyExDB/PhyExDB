<script setup lang="ts">
import type { NuxtError } from "#app"

const props = defineProps({
  error: Object as () => NuxtError,
})
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
      <Button>
        <NuxtLink to="/">Zurück zur Startseite</NuxtLink>
      </Button>
    </div>
  </div>
</template>
