<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { useToast } from "@/components/ui/toast/use-toast"

const { experiment } = defineProps<{
  experiment?: Pick<ExperimentList, "id" | "slug" | "revisionOf"> & { completedReviewsCount?: number }
}>()
const isFinalReview = computed(() => (experiment?.completedReviewsCount ?? 0) >= 1)
const loading = ref(false)
const open = ref(false)

const schema = experimentReviewSchema
const formSchema = toTypedSchema(schema)
const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    approve: true,
    deleteRatingsAndComments: true,
  },
})

const { toast } = useToast()

async function onAccept(deleteRatingsAndComments: boolean) {
  try {
    await $fetch("/api/experiments/review/save", {
      method: "POST",
      body: {
        experimentId: experiment?.id,
        approve: true,
        deleteRatingsAndComments,
      },
    })

    toast({
      title: isFinalReview.value ? "Versuch veröffentlicht" : "Versuch bestätigt",
      description: isFinalReview.value
        ? "Der Versuch ist nun für alle sichtbar."
        : "Ein zweiter Reviewer muss noch zustimmen.",
      variant: "success",
    })

    await navigateTo("/experiments/review")
  } catch {
    toast({
      title: "Fehler",
      description: "Die Bestätigung konnte nicht gespeichert werden.",
      variant: "destructive",
    })
  }
}

const onSubmit = form.handleSubmit(async (values) => {
  if (loading.value) return
  loading.value = true

  if (values.deleteRatingsAndComments == undefined) return

  await onAccept(values.deleteRatingsAndComments)

  open.value = false
  loading.value = false
})

const openForm = (event: boolean) => {
  open.value = event
  if (event) {
    form.resetForm({
      values: {
        approve: true,
        deleteRatingsAndComments: true,
      },
    })
  }
}
</script>

<template>
  <Dialog
    :open="open"
    @update:open="openForm"
  >
    <DialogTrigger as-child>
      <Button
        :variant="isFinalReview ? 'default' : 'outline'"
        size="lg"
        class="transition-all duration-300 shadow-md"
        :class="isFinalReview
          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
          : 'border-blue-600 text-blue-600 hover:border-blue-700'"
      >
        <Icon
          :name="isFinalReview ? 'heroicons:check-badge' : 'heroicons:check'"
          class="mr-2 w-5 h-5"
        />
        {{ isFinalReview ? 'Final Akzeptieren' : 'Akzeptieren' }}
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {{ isFinalReview ? 'Versuch final veröffentlichen' : 'Versuch bestätigen' }}
        </DialogTitle>
        <DialogDescription>
          {{ isFinalReview
            ? 'Du bist der zweite Reviewer. Mit diesem Klick wird der Versuch öffentlich.'
            : 'Du gibst die erste Bestätigung ab. Ein zweiter Reviewer muss noch zustimmen.'
          }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          @click="open = false"
        >
          Abbrechen
        </Button>
        <Button
          type="submit"
          :disabled="loading"
          @click="onSubmit"
        >
          {{ isFinalReview ? 'Jetzt veröffentlichen' : 'Bestätigung speichern' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
