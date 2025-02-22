<script lang="ts" setup>
import getInitials from "~~/shared/utils/initials"

// const user = await useUser()
console.log("loaded auth control")

const user = await useUser()
const impersonatedBy = await useImpersonatedBy()

async function stopImpersonating() {
  await useAuth().client.admin.stopImpersonating()
  await navigateTo("/users")
}

const canSeeUsers = await allows(userAbilities.getAll)
const canReviewExperiments = await allows(experimentAbilities.review)
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
        v-if="impersonatedBy"
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
      <NuxtLink href="/experiments/review">
        <DropdownMenuItem
          v-if="canReviewExperiments"
        >
          <span>Experimente überprüfen</span>
        </DropdownMenuItem>
      </NuxtLink>

      <DropdownMenuSeparator />
      <DropdownMenuItem
        class="text-destructive focus:text-destructive-foreground focus:bg-destructive"
        @click="useAuth().client.signOut()"
      >
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
