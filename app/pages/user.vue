<script setup lang="ts">
import { useUser } from "~/utils/authHelper"

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
