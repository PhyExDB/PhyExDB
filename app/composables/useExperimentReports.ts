import type { ExperimentDetail } from "~~/shared/types"
import { useToast } from "~/components/ui/toast"

export function useExperimentReports(experiment: Ref<ExperimentDetail | null | undefined> | ComputedRef<ExperimentDetail | undefined>) {
  const { toast } = useToast()
  const dismissedIds = ref(new Set<string>())

  const openReports = computed(() =>
    (experiment.value?.openReports ?? []).filter(r => !dismissedIds.value.has(r.id)),
  )

  async function dismissReport(id: string) {
    dismissedIds.value = new Set([...dismissedIds.value, id])

    try {
      await $fetch(`/api/experiments/reports/${id}/complete`, { method: "POST" })
      toast({ title: "Erfolgreich", description: "Die Meldung wurde ausgeblendet.", variant: "success" })
    } catch (error) {
      dismissedIds.value = new Set([...dismissedIds.value].filter(x => x !== id))
      console.error("Dismiss failed:", error)
      toast({ title: "Fehler", description: "Aktion konnte nicht ausgeführt werden.", variant: "destructive" })
    }
  }

  async function startRevision() {
    const exp = experiment.value
    if (!exp) return

    if (exp.revisedBy) {
      await navigateTo(`/experiments/edit/${exp.revisedBy.id}`)
    } else {
      await duplicateExperiment(exp, true)
    }
  }

  return { openReports, dismissReport, startRevision }
}
