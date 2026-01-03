<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { useToast } from "@/components/ui/toast/use-toast"

const { experiment } = defineProps<{ experiment?: Pick<ExperimentList, "slug" | "revisionOf"> }>()

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
  await $fetch(`/api/experiments/review/${experiment?.slug}`, {
    method: "POST",
    body: {
      approve: true,
      deleteRatingsAndComments,
    },
  })

  toast({
    title: "Versuch bestätigt",
    description: "Der Versuch wurde erfolgreich bestätigt.",
    variant: "success",
  })

  await navigateTo("/experiments/review")
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
      <Button>
        Akzeptieren
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Versuch akzeptieren</DialogTitle>
        <DialogDescription>
          Akzeptiere und veröffentliche den Versuch
        </DialogDescription>
      </DialogHeader>
      <form
        class="grid gap-4"
        @submit="onSubmit"
      >
        <FormField
          v-if="experiment?.revisionOf"
          v-slot="{ value, handleChange }"
          type="checkbox"
          name="deleteRatingsAndComments"
        >
          <FormItem class="flex flex-row items-start gap-x-3 space-y-0">
            <FormControl>
              <Checkbox
                :checked="value"
                @update:checked="handleChange"
              />
            </FormControl>
            <div class="space-y-1 leading-none">
              Bewertungen und Kommentare des Versuchs löschen
            </div>
          </FormItem>
        </FormField>
      </form>
      <DialogFooter class="flex flex-col sm:flex-row gap-2">
        <Button
          type="submit"
          variant="outline"
          @click="open = false"
        >
          Abbrechen
        </Button>
        <Button
          type="submit"
          @click="onSubmit"
        >
          Akzeptieren
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
