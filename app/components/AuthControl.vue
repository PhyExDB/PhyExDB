<script lang="ts" setup>
import { User, FlaskConical, Heart, UserX, Users, FolderTree, ClipboardCheck, LogOut } from "lucide-vue-next"
import { ref, watch } from "vue"
import getInitials from "~~/shared/utils/initials"

const user = await useUser()

const { data } = await useAuth().session

const popupShownKey = "reportsPopupShown"
const popupShown = ref(sessionStorage.getItem(popupShownKey) === "true")

type ReportWithExperiment = {
  id: string
  seenByOwner: boolean
  message: string
  createdAt: string
  updatedAt: string
  experiment: {
    id: string
    name: string
    createdAt: string
    updatedAt: string
    userId: string | null
    status: string
    slug: string
    duration: number
    changeRequest: string | null
  }
}

const newReports = ref<ReportWithExperiment[]>([])
const showReportsPopup = ref(false)

watch(
  () => data.value?.user,
  async (newUser) => {
    if (!newUser || popupShown.value) return

    try {
      const reports = await $fetch<ReportWithExperiment[]>("/api/experiments/reports/mine")
      if (reports.length > 0) {
        newReports.value = reports
        showReportsPopup.value = true
      }
    } catch (err) {
      console.error("Fehler beim Abrufen der Reports:", err)
    }
    popupShown.value = true
    sessionStorage.setItem(popupShownKey, "true")
  },
  { immediate: true },
)

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

      <NuxtLink href="/experiments/mine">
        <DropdownMenuItem as-child>
          <span>
            <FlaskConical />
            Meine Versuche
          </span>
        </DropdownMenuItem>
      </NuxtLink>

      <DropdownMenuItem as-child>
        <NuxtLink
          to="/experiments/reports"
          class="w-full block no-underline"
        >
          Reports
        </NuxtLink>
      </DropdownMenuItem>

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
  <div
    v-if="showReportsPopup"
    class="fixed top-24 right-6 w-80 bg-gray-800 text-white border border-gray-700 shadow-lg rounded-md p-4 z-50"
  >
    <p class="font-semibold text-lg mb-2">
      Du hast {{ newReports.length }} Reports offen!
    </p>
    <ul class="max-h-40 overflow-y-auto mb-2">
      <li
        v-for="r in newReports"
        :key="r.id"
        class="border-b border-gray-700 py-1"
      >
        <div class="font-medium">
          {{ r.experiment.name }}
        </div>
        <div class="text-sm text-gray-400">
          {{ r.message }}
        </div>
        <div class="text-xs text-gray-500">
          {{ new Date(r.createdAt).toLocaleString() }}
        </div>
      </li>
    </ul>
    <div class="flex justify-between mt-3">
      <NuxtLink
        class="text-blue-300 hover:text-blue-400 underline"
        href="/experiments/reports"
      >
        Alle ansehen
      </NuxtLink>
      <button
        class="mt-3 text-sm text-blue-300 hover:text-blue-400"
        @click="showReportsPopup = false"
      >
        Schließen
      </button>
    </div>
  </div>
</template>
