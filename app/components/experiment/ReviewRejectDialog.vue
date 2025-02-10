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
        <DialogTitle>Experiment Beanstanden</DialogTitle>
        <DialogDescription>
          Beanstande das Experiment und gib einen Grund an.
        </DialogDescription>
      </DialogHeader>
      <form
        class="grid gap-4"
        @submit="onSubmit"
      >
        <FormField
          v-slot="{ componentField }"
          name="message"
        >
          <FormItem>
            <FormLabel>Begründung</FormLabel>
            <FormControl>
              <Textarea
                id="name"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </form>
      <DialogFooter>
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
          Beanstanden
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
