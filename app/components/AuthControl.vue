<script lang="ts" setup>
const user = await useUser()
</script>

<template>
  <DropdownMenu v-if="user">
    <DropdownMenuTrigger>{{ user.username }}</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>
        <NuxtLink href="/user">
          <span>Profil</span>
        </NuxtLink>
      </DropdownMenuItem>
      <DropdownMenuItem @click="authClient.signOut()">
        <span>Ausloggen</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  <NuxtLink
    v-if="!user"
    href="/login"
  >
    Einloggen
  </NuxtLink>
</template>
