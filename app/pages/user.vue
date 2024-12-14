<script setup lang="ts">
const session = authClient.useSession()
</script>

<template>
  <div>
    <div>
      <pre>{{ session.data }}</pre>
      <button
        v-if="session.data"
        @click="authClient.signOut()"
      >
        Sign out
      </button>
    </div>
  </div>
</template>
