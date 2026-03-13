<script setup lang="ts">
import { AlertTriangle } from "lucide-vue-next"
import { useToast } from "@/components/ui/toast/use-toast"

const props = defineProps<{
  experiment: any
}>()

const { toast } = useToast()

async function dismissReport(reportId: string) {
  if (!confirm("Bist du sicher, dass du diese Bemängelung ablehnen möchtest? Sie wird dann nicht mehr angezeigt.")) {
    return
  }

  try {
    await $fetch(`/api/experiments/reports/${reportId}/complete`, {
      method: "POST",
    })

    if (props.experiment?.openReports) {
      const index = props.experiment.openReports.findIndex((r: any) => r.id === reportId)
      if (index !== -1) {
        props.experiment.openReports.splice(index, 1)
      }
    }

    toast({
      title: "Erfolgreich",
      description: "Die Bemängelung wurde ausgeblendet.",
    })
  } catch (e) {
    toast({
      title: "Fehler",
      description: "Aktion konnte nicht ausgeführt werden.",
      variant: "destructive",
    })
  }
}

async function startRevision() {
  if (props.experiment.revisedBy) {
    await navigateTo(`/experiments/edit/${props.experiment.revisedBy.id}`)
  } else {
    await duplicateExperiment(props.experiment, true)
  }
}
</script>

<template>
  <div
      v-if="experiment?.openReports?.length"
      class="mb-6 overflow-hidden rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50 shadow-sm"
  >
    <div class="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/50 px-4 py-3 text-amber-900 dark:text-amber-100">
      <AlertTriangle class="h-5 w-5 text-amber-600 dark:text-amber-400" />
      <h2 class="text-lg font-bold">Offene Bemängelungen</h2>
    </div>

    <div class="p-4 space-y-4">
      <ul class="space-y-3">
        <li
            v-for="report in experiment.openReports"
            :key="report.id"
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200/50 dark:border-amber-800/50"
        >
          <div class="flex-1 min-w-0">
            <p class="text-sm text-amber-900 dark:text-amber-200 leading-relaxed italic">
              "{{ report.message }}"
            </p>
            <div class="flex items-center gap-2 mt-2 text-[10px] text-amber-700/70 dark:text-amber-400/70 uppercase font-semibold">
              <Icon name="heroicons:calendar" class="w-3 h-3" />
              {{ new Date(report.createdAt).toLocaleDateString() }}
            </div>
          </div>

          <Button
              size="sm"
              variant="ghost"
              class="text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800 shrink-0"
              @click="dismissReport(report.id)"
          >
            <Icon name="heroicons:eye-slash" class="w-4 h-4 mr-2" />
            Ablehnen
          </Button>
        </li>
      </ul>

      <div v-if="!$route.path.includes('/edit/')" class="pt-2 border-t border-amber-200 dark:border-amber-800">
        <Button
            variant="outline"
            class="w-full sm:w-auto bg-amber-100 dark:bg-amber-900 border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100"
            @click="startRevision"
        >
          <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-2" />
          Mängel jetzt beheben
        </Button>
      </div>
    </div>
  </div>
</template>
