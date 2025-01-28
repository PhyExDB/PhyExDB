<script lang="ts" setup>
import getInitials from "~~/shared/utils/initials"

const user = await useUser()

const { data } = await useAuth().session
const impersonatedBy = data.value?.session.impersonatedBy
async function stopImpersonating() {
  await useAuth().client.admin.stopImpersonating()
  await navigateTo("/users")
}
</script>

<template>
  <DropdownMenu v-if="user">
    <DropdownMenuTrigger>
      <Avatar>
        <AvatarFallback>{{ getInitials(user.name) }}</AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>
        <NuxtLink href="/profile">
          <span>Profil</span>
        </NuxtLink>
      </DropdownMenuItem>
      <DropdownMenuItem @click="useAuth().client.signOut()">
        <span>Abmelden</span>
      </DropdownMenuItem>
      
      <DropdownMenuItem v-if="impersonatedBy" @click="stopImpersonating">
        <span>Imitieren beenden</span>
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
