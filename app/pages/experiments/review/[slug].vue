<script lang="ts" setup>
import { ref } from "vue"
import { useToast } from "@/components/ui/toast/use-toast"

const user = await useUser()
const showInput = ref(false)
const showConfirmation = ref(false) // Bestätigung, ob die Beanstandung wirklich gesendet werden soll
const hasToggled = ref(false) // Variable zum Verfolgen, ob der Modus gewechselt wurde
const openDialog = ref(false) // Steuerung für das Dialog-Fenster

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
// Wechsel zwischen den Modi (Beanstandung oder Bestätigung)
const toggleReviewMode = () => {
  if (!hasToggled.value) {
    showConfirmation.value = !showConfirmation.value
    showInput.value = !showInput.value // Zeige das Eingabefeld, wenn der Bestätigungsmodus aktiv ist
    hasToggled.value = true // Setze den Modus auf 'umgeschaltet'
  } else {
    // Öffne das Bestätigungs-Popup, wenn der Button erneut gedrückt wird
    openDialog.value = true
  }
}

const closeDialog = () => {
  openDialog.value = false
}

const confirmAndDelete = async () => {
  await onDelete("Beanstandung bestätigt")
  closeDialog() // Schließe das Dialog-Fenster nach Bestätigung
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
          :reviewStarted="showInput"
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
          @click="toggleReviewMode"
        >
          {{ !showInput ? "Beanstanden" : "Bestätigen" }} <!-- Button-Text ändern, wenn Review-Modus aktiv -->
        </Button>
      </ExperimentReviewRejectDialog>
    </div>
    <!-- Bestätigungs-Popup -->
    <Dialog :open="openDialog" @update:open="closeDialog">
      <DialogTrigger as-child>
        <slot />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bestätigen Sie die Beanstandung</DialogTitle>
          <DialogDescription>
            Möchten Sie die Beanstandung dieses Versuchs wirklich bestätigen? Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            @click="closeDialog"
          >
            Abbrechen
          </Button>
          <!-- Hier müssten jetzt noch die Beanstandungseinträge gesammeelt und abgeschickt werden -->
          <Button
            type="submit"
            variant="destructive"
            @click="confirmAndDelete"
          >
            Bestätigen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
