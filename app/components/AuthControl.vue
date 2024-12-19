<script lang="ts" setup>
import getInitials from "~~/shared/utils/initials"

const user = await useUser()
</script>

<template>
  <DropdownMenu v-if="user">
    <DropdownMenuTrigger>
      <NuxtLink href="/user">
        <Avatar>
          <AvatarFallback>{{ getInitials(user.username) }}</AvatarFallback>
        </Avatar>
      </NuxtLink>
    </DropdownMenuTrigger>
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
  <Button v-if="!user">
    <NuxtLink
      href="/login"
    >
      Einloggen
    </NuxtLink>
  </Button>
</template>
