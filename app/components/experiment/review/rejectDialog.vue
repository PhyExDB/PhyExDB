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
    <slot />
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Versuch beanstanden</DialogTitle>
        <DialogDescription>
          Möchten Sie die Beanstandung dieses Versuchs wirklich absenden?
          Diese Aktion kann nicht rückgängig gemacht werden.
        </DialogDescription>
      </DialogHeader>

      <form @submit="onSubmit">
        <!-- Hier können Eingabefelder einfügt werden, falls benötigt -->
      </form>

      <DialogFooter class="flex flex-col sm:flex-row gap-2">
        <DialogClose as-child>
          <Button
            type="button"
            variant="outline"
          >
            Abbrechen
          </Button>
        </DialogClose>

        <Button
          type="submit"
          variant="destructive"
          :disabled="loading"
          @click="onSubmit"
        >
          Senden
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
