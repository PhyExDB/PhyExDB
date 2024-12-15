<script setup lang="ts">
const { data: session } = await authClient.useSession(useFetch)
</script>

<template>
  <div>
    <div>
      <pre>{{ session }}</pre>
      <button
        v-if="session"
        @click="authClient.signOut()"
      >
        Sign out
      </button>
    </div>
  </div>
</template>
