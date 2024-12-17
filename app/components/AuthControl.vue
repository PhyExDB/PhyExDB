<script lang="ts" setup>
const { data: session } = await authClient.useSession(useFetch)
</script>

<template>
  <div>
    <NuxtLink
      v-if="!session"
      href="/login"
    >
      <Button>
        Anmelden
      </Button>
    </NuxtLink>

    <NuxtLink
      v-if="session"
      href="/user"
    >
      <Button>
        {{ session.user.name }}
      </Button>
    </NuxtLink>
    <Button
      v-if="session"
      @click="authClient.signOut()"
    >
      Sign out
    </Button>
  </div>
</template>
