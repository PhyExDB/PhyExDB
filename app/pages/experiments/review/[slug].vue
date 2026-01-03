<script lang="ts" setup>
import { useToast } from "@/components/ui/toast/use-toast"

const user = await useUser()
const route = useRoute()
const { toast } = useToast()

if (!user.value || user.value.role === "USER") {
  await navigateTo("/")
}

const { data: experiment } = await useFetch<unknown>(`/api/experiments/${route.params.slug}`)

const hasToggled = ref(false)
const openDialog = ref(false)
const comments = ref<Record<string, string>>({})

const handleAction = () => {
  if (!hasToggled.value) {
    hasToggled.value = true
  } else {
    openDialog.value = true
  }
}

async function submitReject() {
  try {
    await $fetch("/api/experiments/review/save", {
      method: "POST",
      body: {
        experimentId: experiment.value.id,
        comments: comments.value,
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
  <div class="container py-10 pb-32">
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
        :on-submit="submitReject"
      >
        <Button
          :variant="hasToggled ? 'destructive' : 'outline'"
          size="lg"
          @click="handleAction"
        >
          <Icon
            :name="hasToggled ? 'heroicons:paper-airplane' : 'heroicons:exclamation-triangle'"
            class="mr-2"
          />
          {{ hasToggled ? "Review jetzt absenden" : "Beanstanden" }}
        </Button>
      </ExperimentReviewRejectDialog>
    </div>
  </div>
</template>
