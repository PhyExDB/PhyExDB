<script lang="ts" setup>
import { User, FlaskConical, Heart, Users, FolderTree, ClipboardCheck, LogOut, AlertTriangle, Bell } from "lucide-vue-next"
import getInitials from "~~/shared/utils/initials"

const user = await useUser()
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
  <InboxBadge v-if="user" />
  <DropdownMenu
    v-if="user"
    v-model:open="dropdownOpen"
  >
    <ReportNotification />

    <DropdownMenuTrigger as-child>
      <button
        class="focus:outline-none"
        type="button"
      >
        <div class="relative inline-block">
          <Avatar react>
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
          <span>
            <User />
            Profil
          </span>
        </DropdownMenuItem>
      </NuxtLink>

      <NuxtLink href="/inbox">
        <DropdownMenuItem as-child>
          <span>
            <Bell />
            Postfach
            <Badge
              v-if="pendingReviewCount > 0"
              variant="destructive"
              class="ml-auto h-5 min-w-5 text-[10px]"
            >
              {{ pendingReviewCount }}
            </Badge>
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

      <NuxtLink to="/experiments/reports">
        <DropdownMenuItem as-child>
          <span>
            <AlertTriangle />
            Reports
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
        <DropdownMenuItem class="flex items-center gap-2">
          <ClipboardCheck />
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
