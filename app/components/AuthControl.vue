<script lang="ts" setup>
import getInitials from "~~/shared/utils/initials"

const user = await useUser()

const { data } = await useAuth().session
async function stopImpersonating() {
  await useAuth().client.admin.stopImpersonating()
  await navigateTo("/users")
}

const allowed = await allows(userAbilities.getAll)
</script>

<template>
  <DropdownMenu v-if="user">
    <DropdownMenuTrigger as-child>
      <Avatar>
        <AvatarFallback>{{ getInitials(user.name) }}</AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem as-child>
        <NuxtLink href="/profile">
          <span>Profil</span>
        </NuxtLink>
      </DropdownMenuItem>

      <DropdownMenuItem
        v-if="data?.session.impersonatedBy"
        @click="stopImpersonating"
      >
        <span>Imitieren beenden</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        v-if="allowed"
      >
        <NuxtLink href="/users">
          <span>Nutzerverwaltung</span>
        </NuxtLink>
      </DropdownMenuItem>

      <DropdownMenuItem @click="useAuth().client.signOut()">
        <span>Abmelden</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  <Button v-if="!user">
    <NuxtLink
      @click.prevent="navigateToWithRedirect('/login')"
    >
      Anmelden
    </NuxtLink>
  </Button>
</template>
