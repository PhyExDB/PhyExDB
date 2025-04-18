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
  showError({ statusCode: 404, statusMessage: "Versuch nicht gefunden" })
}

if (experiment.value && experiment.value.status !== "IN_REVIEW") {
  await navigateTo("/")
}

const { toast } = useToast()

async function onDelete(message: string) {
  await $fetch(`/api/experiments/review/${experimentSlug}`, {
    method: "POST",
    body: JSON.stringify({ approve: false, message }),
  })

  toast({
    title: "Versuch beanstandet",
    description: "Der Versuch wurde erfolgreich beanstandet.",
    variant: "success",
  })

  await navigateTo("/experiments/review")
}
</script>

<template>
  <div>
    <h2 class="text-4xl font-extrabold pb-4">
      Zu überprüfender Versuch
    </h2>
    <h3
      v-if="experiment?.revisionOf"
      class="text-2xl font-bold pb-4"
    >
      Dies ist eine Überarbeitung von
      <NuxtLink
        :to="`/experiments/${experiment?.revisionOf?.slug}`"
        class="underline"
      >
        {{ experiment?.revisionOf?.name }}
      </NuxtLink>
    </h3>
    <Card>
      <CardContent class="my-6 mx-4">
        <ExperimentDetail
          :experiment="experiment"
          :show-dropdown="false"
          :preview="true"
        />
      </CardContent>
    </Card>
    <div class="mt-4 flex flex-col sm:flex-row gap-2">
      <ExperimentReviewAcceptDialog
        :experiment="experiment"
      />
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
