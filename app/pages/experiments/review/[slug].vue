<script lang="ts" setup>
import { useToast } from "@/components/ui/toast/use-toast"

const user = await useUser()

if (!user.value || user.value.role == "USER") {
  await navigateTo("/")
}

const route = useRoute()
const experimentSlug = route.params.slug as string
const { data: experiment } = useFetch<ExperimentDetail>(`/api/experiments/${experimentSlug}`)

if (!experiment) {
  showError({ statusCode: 404, statusMessage: "Experiment nicht gefunden" })
}

console.log(experiment.value?.status)
if (experiment.value && experiment.value.status !== "IN_REVIEW") {
  await navigateTo("/")
}

const { toast } = useToast()

async function onApprove() {
  await $fetch(`/api/experiments/review/${experimentSlug}`, {
    method: "POST",
    body: {
      approve: true,
    },
  })

  toast({
    title: "Experiment bestätigt",
    description: "Das Experiment wurde erfolgreich bestätigt.",
    variant: "success",
  })

  await navigateTo("/experiments/review")
}

async function onDelete(message: string) {
  await $fetch(`/api/experiments/review/${experimentSlug}`, {
    method: "POST",
    body: JSON.stringify({ approve: false, message }),
  })

  toast({
    title: "Experiment beanstandet",
    description: "Das Experiment wurde erfolgreich beanstandet.",
    variant: "success",
  })

  await navigateTo("/experiments/review")
}
</script>

<template>
  <div>
    <h2 class="text-4xl font-extrabold pb-4">
      Zu überprüfendes Experiment
    </h2>
    <Card>
      <CardContent class="my-6 mx-4">
        <ExperimentDetail
          :experiment="experiment"
        />
      </CardContent>
    </Card>
    <div class="mt-4 flex flex-col sm:flex-row gap-2">
      <Button
        class="flex-1"
        @click="onApprove"
      >
        Bestätigen
      </Button>
      <ExperimentReviewRejectDialog
        :on-delete="onDelete"
      >
        <Button
          variant="destructive"
          class="flex-1"
        >
          Beanstanden
        </Button>
      </ExperimentReviewRejectDialog>
    </div>
  </div>
</template>
