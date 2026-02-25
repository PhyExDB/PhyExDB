<script lang="ts" setup>
import type { ReportWithExperiment } from "~~/shared/types"

const user = await useUser()
const newReports = ref<ReportWithExperiment[]>([])
const showPopup = ref(false)
const hasChecked = ref(false)

watch(
  user,
  async (currentUser) => {
    if (!currentUser || hasChecked.value) return
    hasChecked.value = true

    try {
      const reports = await $fetch<ReportWithExperiment[]>("/api/experiments/reports/mine")
      if (reports.length > 0) {
        newReports.value = reports
        showPopup.value = true
      }
    } catch (err) {
      console.error("Fehler beim Abrufen der Reports:", err)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div
    v-if="showPopup"
    class="fixed top-24 right-6 w-80 border shadow-lg rounded-md p-4 z-50 bg-background text-foreground"
  >
    <p class="font-semibold text-lg mb-2">
      Du hast {{ newReports.length }} offene Reports!
    </p>
    <ul class="max-h-40 overflow-y-auto mb-2 space-y-2">
      <li
        v-for="r in newReports"
        :key="r.id"
        class="border-b pb-2"
      >
        <div class="font-medium">
          {{ r.experiment.name }}
        </div>
        <div class="text-sm text-muted-foreground">
          {{ r.message }}
        </div>
        <div class="text-xs text-muted-foreground">
          {{ new Date(r.createdAt).toLocaleString() }}
        </div>
      </li>
    </ul>
    <div class="flex justify-between items-center mt-3">
      <NuxtLink
        class="text-primary hover:underline text-sm"
        to="/experiments/reports"
      >
        Alle ansehen
      </NuxtLink>
      <Button
        size="sm"
        variant="ghost"
        @click="showPopup = false"
      >
        Schließen
      </Button>
    </div>
  </div>
</template>
