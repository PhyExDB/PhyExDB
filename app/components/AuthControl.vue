<script lang="ts" setup>
import getInitials from "~~/shared/utils/initials"
import type { Prisma } from '@prisma/client'

const user = await useUser()

const { data } = await useAuth().session

watch(
    () => data.value?.user,
    (newUser) => {
      if (newUser) {
        checkNewReports()
      }
    },
    { immediate: true }
)

type ReportWithExperiment = Prisma.ReportGetPayload<{
  include: { experiment: true }
}>

const newReports = ref<ReportWithExperiment[]>([]) //Array für neue reports
const showReportsPopup = ref(false)  //Steuerung, ob popup angezeigt wird

async function checkNewReports() {
  if(!user || !data.value?.user) return
  try {
    const reports = await $fetch<ReportWithExperiment[]>('/api/experiments/reports/mine')
    console.log("API Antwort:", reports)

    if(reports && reports.length > 0) {
      newReports.value = reports
      console.log("Gesetztes Array:", newReports.value)
      showReportsPopup.value = true

      await $fetch('/api/experiments/reports/mark-seen', {
        method: 'POST',
        body: { reportsIds: reports.map(r => r.id) }
      })
    }
  } catch(err) {
    console.error("Fehler beim Abrufen der Reports:", err)
  }
}
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
    <h4 class="font-semibold text-lg mb-2">
      Neue Reports für deine Experimente
    </h4>
    <ul
        class="text-sm max-h-40 overflow-y-auto"
    >
      <li
          v-for="r in newReports"
          :key="r.id"
          class="mb-1"
      >
        <div class="font-medium">
          {{ r.experiment.name }}
        </div>
        <div class="text-muted-foreground">
          {{ r.message }}
        </div>
      </li>
    </ul>
    <button
        class="mt-3 text-sm text-blue-300 hover:text-blue-400"
        @click="showReportsPopup = false"
    >
      Schließen
    </button>
  </div>
</template>
