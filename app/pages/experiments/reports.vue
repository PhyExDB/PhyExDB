<script setup lang="ts">
import type { ReportWithExperiment } from "~~/shared/types"

const { data: reports, refresh, status } = await useFetch<ReportWithExperiment[]>("/api/experiments/reports/mine", {
  transform: data => data.filter(r => !r.seenByOwner),
  default: () => [],
})

const currentlyProcessing = ref<string | null>(null)

async function markAsDone(reportId: string) {
  currentlyProcessing.value = reportId
  try {
    await $fetch(`/api/experiments/reports/${reportId}/complete`, {
      method: "POST",
    })
    await refresh()
  } catch (err) {
    console.error("Fehler beim Markieren als erledigt:", err)
  } finally {
    currentlyProcessing.value = null
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 py-8 px-4">
    <h1 class="text-3xl font-bold tracking-tight">
      Offene Reports
    </h1>

    <div
      v-if="reports.length === 0 && status !== 'pending'"
      class="text-muted-foreground text-center py-12 border-2 border-dashed rounded-xl"
    >
      Keine offenen Reports gefunden.
    </div>

    <div
      v-else
      class="space-y-4"
    >
      <div
        v-for="report in reports"
        :key="report.id"
        class="border rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card shadow-sm"
      >
        <div class="space-y-1">
          <p class="font-bold text-lg leading-none">
            {{ report.experiment.name }}
          </p>
          <p class="text-sm text-muted-foreground leading-relaxed">
            {{ report.message }}
          </p>
          <p class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
            {{ new Date(report.createdAt).toLocaleString('de-DE') }}
          </p>
        </div>

        <div class="flex gap-2 w-full sm:w-auto">
          <Button
            as-child
            size="sm"
            variant="outline"
            class="flex-1 sm:flex-none"
          >
            <NuxtLink :to="`/experiments/edit/${report.experiment.slug}`">
              Bearbeiten
            </NuxtLink>
          </Button>

          <Button
              size="sm"
              variant="secondary"
              :disabled="currentlyProcessing !== null || status === 'pending'"
              @click="markAsDone(report.id)"
          >
            <Icon
                v-if="currentlyProcessing === report.id"
                name="lucide:loader-2"
                class="mr-2 h-4 w-4 animate-spin"
            />
            Erledigt
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
