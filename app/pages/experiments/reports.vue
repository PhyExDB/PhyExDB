<script setup lang="ts">
import type { ReportWithExperiment } from "~~/shared/types"

const reports = ref<ReportWithExperiment[]>([])
const loading = ref(false)

async function loadReports() {
  try {
    const data = await $fetch<ReportWithExperiment[]>("/api/experiments/reports/mine")
    reports.value = data.filter(r => !r.seenByOwner)
  } catch (err) {
    console.error("Fehler beim Laden der Reports:", err)
  }
}

async function markAsDone(reportId: string) {
  loading.value = true
  try {
    await $fetch(`/api/experiments/reports/${reportId}/complete`, {
      method: "POST",
    })
    reports.value = reports.value.filter(r => r.id !== reportId)
  } catch (err) {
    console.error("Fehler beim Markieren als erledigt:", err)
  } finally {
    loading.value = false
  }
}

await loadReports()
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 py-8">
    <h1 class="text-3xl font-bold mb-4">
      Offene Reports
    </h1>

    <div
      v-if="reports.length === 0"
      class="text-muted-foreground text-center py-8"
    >
      Keine offenen Reports.
    </div>

    <div
      v-for="report in reports"
      :key="report.id"
      class="border rounded-lg p-4 flex justify-between items-center"
    >
      <div>
        <p class="font-semibold">
          {{ report.experiment.name }}
        </p>
        <p class="text-sm text-muted-foreground">
          {{ report.message }}
        </p>
        <p class="text-xs text-muted-foreground">
          {{ new Date(report.createdAt).toLocaleString() }}
        </p>
      </div>

      <div class="flex gap-2">
        <NuxtLink :to="`/experiments/edit/${report.experiment.slug}`">
          <Button
            size="sm"
            variant="outline"
          >
            Bearbeiten
          </Button>
        </NuxtLink>
        <Button
          size="sm"
          variant="secondary"
          :disabled="loading"
          @click="markAsDone(report.id)"
        >
          Erledigt
        </Button>
      </div>
    </div>
  </div>
</template>
