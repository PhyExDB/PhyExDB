<script lang="ts" setup>
import getInitials from "~~/shared/utils/initials"

const user = await useUser()
</script>

<template>
  <DropdownMenu v-if="user">
    <DropdownMenuTrigger>
      <Avatar>
        <AvatarFallback>{{ getInitials(user.username) }}</AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>
        <NuxtLink href="/profile">
          <span>Profil</span>
        </NuxtLink>
      </DropdownMenuItem>
      <DropdownMenuItem @click="authClient.signOut()">
        <span>Abmelden</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  <Button v-if="!user">
    <NuxtLink
      href="/login"
    >
      Anmelden
    </NuxtLink>
  </Button>
</template>
