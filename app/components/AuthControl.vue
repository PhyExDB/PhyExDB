<script lang="ts" setup>
import { User, FlaskConical, Heart, UserX, Users, FolderTree, ClipboardCheck, LogOut } from "lucide-vue-next"
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
  await navigateTo("/")
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
          <span>
            <User />
            Profil
          </span>
        </DropdownMenuItem>
      </NuxtLink>

      <NuxtLink href="/experiments/mine">
        <DropdownMenuItem as-child>
          <span>
            <FlaskConical />
            Meine Versuche
          </span>
        </DropdownMenuItem>
      </NuxtLink>

      <NuxtLink href="/experiments/favorites">
        <DropdownMenuItem as-child>
          <span>
            <Heart />
            Meine Favoriten
          </span>
        </DropdownMenuItem>
      </NuxtLink>

      <DropdownMenuSeparator v-if="canSeeUsers || canReviewExperiments" />
      <DropdownMenuItem
          v-if="data?.session.impersonatedBy"
          @click="stopImpersonating"
      >
        <UserX />
        <span>Imitieren beenden</span>
      </DropdownMenuItem>
      <NuxtLink href="/users">
        <DropdownMenuItem v-if="canSeeUsers">
          <Users />
          <span>Nutzerverwaltung</span>
        </DropdownMenuItem>
      </NuxtLink>
      <NuxtLink href="/admin/categories">
        <DropdownMenuItem v-if="canSeeUsers">
          <FolderTree />
          <span>Kategorien verwalten</span>
        </DropdownMenuItem>
      </NuxtLink>
      <NuxtLink
          v-if="canReviewExperiments"
          href="/experiments/review"
      >
        <DropdownMenuItem>
          <ClipboardCheck />
          <span>Versuche überprüfen</span>
        </DropdownMenuItem>
      </NuxtLink>

      <DropdownMenuSeparator />
      <DropdownMenuItem
          class="text-destructive focus:text-destructive-foreground focus:bg-destructive"
          @click="signOut"
      >
        <LogOut />
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
