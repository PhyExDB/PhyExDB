<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"

const { onDelete } = defineProps({
  onDelete: {
    type: Function as PropType<(message: string) => Promise<void>>,
    required: true,
  },
})

const loading = ref(false)
const open = ref(false)

const schema = experimentReviewSchema
const formSchema = toTypedSchema(schema)
const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    approve: false,
    message: "",
  },
})

const onSubmit = form.handleSubmit(async (values) => {
  if (loading.value) return
  loading.value = true

  if (values.message == undefined) return

  await onDelete(values.message)

  open.value = false
  loading.value = false
})

const openForm = (event: boolean) => {
  open.value = event
  if (event) {
    form.resetForm({
      values: {
        approve: false,
        message: "",
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
      <slot />
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Versuch beanstanden</DialogTitle>
        <DialogDescription>
          Hiermit bestätigen Sie die Beanstandung des Versuchs.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="flex flex-col sm:flex-row gap-2">
        <Button
          type="submit"
          @click="open = false"
        >
          Abbrechen
        </Button>
        <Button
          type="submit"
          variant="destructive"
          @click="onSubmit"
        >
          Senden
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
