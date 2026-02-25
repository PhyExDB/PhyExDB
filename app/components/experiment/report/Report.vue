<script setup lang="ts">
import type { ReportWithExperiment } from "~~/shared/types"
import { useToast } from "@/components/ui/toast/use-toast"

const { toast } = useToast()
const loading = ref(false)

const { data: reports, refresh } = await useFetch<ReportWithExperiment[]>(
  "/api/experiments/reports/mine",
)

async function markAsDone(reportId: string) {
  loading.value = true
  try {
    await $fetch(`/api/experiments/reports/${reportId}/complete`, {
      method: "POST",
    })
    await refresh()
    toast({
      title: "Erledigt",
      description: "Report wurde als erledigt markiert.",
      variant: "success",
    })
  } catch (err) {
    console.error("Fehler beim Markieren als erledigt:", err)
    toast({
      title: "Fehler",
      description: "Report konnte nicht als erledigt markiert werden.",
      variant: "destructive",
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 py-8">
    <h1 class="text-3xl font-bold mb-4">
      Offene Reports
    </h1>

    <div
      v-if="!reports?.length"
      class="text-muted-foreground text-center py-8"
    >
      Keine offenen Reports.
    </div>

    <div
      v-for="report in reports"
      :key="report.id"
      class="border rounded-lg p-4 flex justify-between items-start gap-4"
    >
      <div class="flex-1 min-w-0">
        <p class="font-semibold">
          {{ report.experiment.name }}
        </p>
        <p class="text-sm text-muted-foreground mt-1">
          {{ report.message }}
        </p>
        <p class="text-xs text-muted-foreground mt-1">
          {{ new Date(report.createdAt).toLocaleString() }}
        </p>
      </div>

      <div class="flex gap-2 shrink-0">
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
