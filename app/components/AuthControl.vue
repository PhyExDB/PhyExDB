<script lang="ts" setup>
import getInitials from "~~/shared/utils/initials"
import { ref, watch } from 'vue'

const user = await useUser()

const { data } = await useAuth().session

const popupShownKey  = "reportsPopupShown"
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
        const reports = await $fetch<ReportWithExperiment[]>('/api/experiments/reports/mine')
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
    { immediate: true }
)

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
          <span>Profil</span>
        </DropdownMenuItem>
      </NuxtLink>

      <NuxtLink href="/experiments/mine">
        <DropdownMenuItem as-child>
          <span>Meine Versuche</span>
        </DropdownMenuItem>
      </NuxtLink>

      <DropdownMenuItem as-child>
        <NuxtLink to="/experiments/reports" class="w-full block no-underline">
          Reports
        </NuxtLink>
      </DropdownMenuItem>

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
        <div class="font-medium">{{ r.experiment.name }}</div>
        <div class="text-sm text-gray-400">{{ r.message }}</div>
        <div class="text-xs text-gray-500">{{ new Date(r.createdAt).toLocaleString() }}</div>
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
