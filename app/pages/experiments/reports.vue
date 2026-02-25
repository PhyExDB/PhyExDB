<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "#imports"

type ReportWithExperiment = {
  id: string
  seenByOwner: boolean
  message: string
  createdAt: string
  updatedAt: string
  experiment: {
    id: string
    name: string
    slug: string
    createdAt: string
    updatedAt: string
  }
}

const reports = ref<ReportWithExperiment[]>([])
const router = useRouter()
const loading = ref(false)

// Alle Reports laden
async function loadReports() {
  try {
    const data = await $fetch<ReportWithExperiment[]>("/api/experiments/reports/mine")
    reports.value = data.filter(r => !r.seenByOwner) // nur offene anzeigen
  } catch (err) {
    console.error("Fehler beim Laden der Reports:", err)
  }
}

// Report als erledigt markieren
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

function editExperiment(experimentId: string) {
  router.push(`/experiments/edit/${experimentId}`)
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
      class="text-gray-400 text-center py-8"
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
        <p class="text-sm text-gray-400">
          {{ report.message }}
        </p>
        <p class="text-xs text-gray-500">
          {{ new Date(report.createdAt).toLocaleString() }}
        </p>
      </div>

      <div class="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          @click="editExperiment(report.experiment.id)"
        >
          Bearbeiten
        </Button>
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
