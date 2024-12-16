<script setup lang="ts">
const user = await useUser()
</script>

<template>
  <div>
    <div>
      <pre>{{ user }}</pre>
      <button
        v-if="user"
        @click="authClient.signOut()"
      >
        Sign out
      </button>
    </div>
  </div>
</template>
