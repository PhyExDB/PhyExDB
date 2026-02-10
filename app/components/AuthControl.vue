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

const { data: notificationData, refresh: refreshNotifications } = await useFetch("/api/notifications/check", {
  server: false,
})
const pendingReviewCount = computed(() => notificationData.value?.moderatorNotifications ?? 0)

async function signOut() {
  await useAuth().client.signOut()
  if (user.value) {
    sessionStorage.removeItem(`notif-seen-${user.value.id}`)
    sessionStorage.removeItem(`mod-notif-seen-${user.value.id}`)
  }
  await navigateTo("/")
}

const route = useRoute()
watch(() => route.fullPath, () => {
  if (canReviewExperiments) {
    refreshNotifications()
  }
}, { immediate: true })

const dropdownOpen = ref(false)
</script>

<template>
  <DropdownMenu
    v-if="user"
    v-model:open="dropdownOpen"
  >
    <DropdownMenuTrigger as-child>
      <button
        class="focus:outline-none"
        type="button"
      >
        <div class="relative inline-block">
          <Avatar>
            <AvatarFallback>{{ getInitials(user.name) }}</AvatarFallback>
          </Avatar>

          <div
            v-if="canReviewExperiments && pendingReviewCount > 0 && !dropdownOpen"
            class="absolute -right-0.5 -top-0.5 flex h-4 w-4"
          >
            <Badge
              variant="destructive"
              class="absolute inset-0 h-full w-full animate-ping rounded-full min-w-0 p-0 opacity-75 border-none"
            />
            <Badge
              variant="destructive"
              class="relative h-full w-full rounded-full min-w-0 p-0 border-2 border-background"
            />
          </div>
        </div>
      </button>
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
      <NuxtLink href="/admin/categories">
        <DropdownMenuItem
          v-if="canSeeUsers"
        >
          <span>Kategorien verwalten</span>
        </DropdownMenuItem>
      </NuxtLink>
      <NuxtLink
        v-if="canReviewExperiments"
        href="/experiments/review"
      >
        <DropdownMenuItem class="flex items-center gap-2">
          <span>Versuche überprüfen</span>
          <Badge
            v-if="pendingReviewCount > 0"
            variant="destructive"
            class="ml-auto"
          >
            {{ pendingReviewCount }}
          </Badge>
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
