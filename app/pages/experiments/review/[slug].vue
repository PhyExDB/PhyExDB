<script lang="ts" setup>
import { useToast } from "@/components/ui/toast/use-toast"

const user = await useUser()

if (!user.value || user.value.role === "USER") {
  await navigateTo("/")
}

const route = useRoute()
const { data: experiment } = await useFetch<ExperimentDetail>(`/api/experiments/${route.params.slug}`)

if (!experiment) {
  showError({ statusCode: 404, statusMessage: "Versuch nicht gefunden" })
}

if (experiment.value && experiment.value.status !== "IN_REVIEW") {
  await navigateTo("/")
}

const { toast } = useToast()
const hasToggled = ref(false)
const openDialog = ref(false)
const comments = ref<Record<string, string>>({})

const handleAction = () => {
  if (!hasToggled.value) {
    hasToggled.value = true
    toast({
      title: "Review-Modus aktiviert",
      description: "Du kannst nun Beanstandungen direkt in den Abschnitten verfassen.",
    })
  } else {
    openDialog.value = true
  }
}

async function submitReject() {
  if (!experiment.value) return

  try {
    await $fetch("/api/experiments/review/save", {
      method: "POST",
      body: {
        experimentId: experiment.value.id,
        comments: comments.value,
        approve: false,
      },
    })
    toast({ title: "Gesendet", description: "Beanstandungen wurden erfolgreich gespeichert." })
    await navigateTo("/experiments/review")
  } catch {
    toast({ title: "Fehler", variant: "destructive", description: "Speichern fehlgeschlagen." })
  }
}
</script>

<template>
  <div
    v-if="experiment"
    class="container py-10 pb-32"
  >
    <ExperimentDetail
      v-model:comments="comments"
      :experiment="experiment"
      :review-started="hasToggled"
      preview
    />

    <div class="fixed bottom-0 left-0 w-full bg-background/80 backdrop-blur-md border-t p-6 flex justify-center gap-4 z-50">
      <ExperimentReviewAcceptDialog :experiment="experiment" />

      <ExperimentReviewRejectDialog
        v-model:open="openDialog"
        :on-delete="submitReject"
      >
        <Button
          :variant="hasToggled ? 'default' : 'outline'"
          size="lg"
          class="transition-all duration-300 shadow-md"
          :class="'bg-red-600 hover:bg-red-700 text-white border-red-700'"
          @click="handleAction"
        >
          <Icon
            :name="hasToggled ? 'heroicons:paper-airplane' : 'heroicons:exclamation-triangle'"
            class="mr-2 w-5 h-5"
          />
          {{ hasToggled ? "Review jetzt absenden" : "Beanstanden" }}
        </Button>
      </ExperimentReviewRejectDialog>
    </div>
  </div>
  <div
    v-else
    class="flex justify-center py-20"
  >
    <Icon
      name="heroicons:arrow-path"
      class="w-10 h-10 animate-spin text-muted"
    />
  </div>
</template>
