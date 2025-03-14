<script lang="ts" setup>
import getInitials from "~~/shared/utils/initials"

const user = await useUser()

const { data } = await useAuth().session
async function stopImpersonating() {
  await useAuth().client.admin.stopImpersonating()
  await navigateTo("/users")
}

const canSeeUsers = await allows(userAbilities.getAll)
const canReviewExperiments = await allows(experimentAbilities.review)

async function signOut() {
  await useAuth().client.signOut()
  // await navigateTo("/")
}
</script>

<template>
  <DropdownMenu v-if="user">
    <DropdownMenuTrigger as-child>
      <Avatar>
        <AvatarFallback>{{ getInitials(user.name) }}</AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <NuxtLink href="/profile">
        <DropdownMenuItem as-child>
          <span>Profil</span>
        </DropdownMenuItem>
      </NuxtLink>

      <NuxtLink href="/experiments/mine">
        <DropdownMenuItem as-child>
          <span>Meine Versuche</span>
        </DropdownMenuItem>
      </NuxtLink>

      <DropdownMenuSeparator v-if="canSeeUsers || canReviewExperiments" />
      <DropdownMenuItem
        v-if="data?.session.impersonatedBy"
        @click="stopImpersonating"
      >
        <span>Imitieren beenden</span>
      </DropdownMenuItem>
      <NuxtLink href="/users">

        <DropdownMenuItem
          v-if="canSeeUsers"
        >
          <span>Nutzerverwaltung</span>
        </DropdownMenuItem>
      </NuxtLink>
      <NuxtLink
        v-if="canReviewExperiments"
        href="/experiments/review"
      >
        <DropdownMenuItem>
          <span>Versuche überprüfen</span>
        </DropdownMenuItem>
      </NuxtLink>

      <DropdownMenuSeparator />
      <DropdownMenuItem
        class="text-destructive focus:text-destructive-foreground focus:bg-destructive"
        @click="signOut"
      >
        <span>Abmelden</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  <NuxtLink
    to="/login"
  >
    <Button v-if="!user">
      Anmelden
    </Button>
  </NuxtLink>
</template>
