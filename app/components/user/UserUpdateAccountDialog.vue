<script lang="ts" setup>
import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { z } from "zod"

const { user } = defineProps({
  user: {
    type: Object as PropType<UserDetail>,
    required: true,
  },
})

const loading = ref(false)
const knownMails: string[] = []
const open = ref(false)

const schema = userUpdateSchema.and(
  z.object({
    email: z.string().refine(
      value => !knownMails.includes(value),
      { message: "Es existiert bereist ein Account mit dieser E-Mail." },
    ),
  }),
)

const formSchema = toTypedSchema(schema)
const form = useForm({ validationSchema: formSchema, initialValues: user })

/**
 * Reset the form when reopening to avoid validation errors
 * @param event - The event to open the dialog
 */
const openForm = (event: boolean) => {
  open.value = event
  console.log("open", event)
  if (event) {
    form.resetForm()
  }
}

// Watch for changes in the user prop and reset the form values
watch(() => user, (newUser) => {
  if (!open.value) {
    form.resetForm({
      values: newUser,
    })
  }
})

const onSubmit = form.handleSubmit(async (values) => {
  if (loading.value) return
  loading.value = true
  let hasError = false

  if (values.username !== user.username) {
    await authClient.updateUser({
      name: values.username,
    })
  }

  if (values.email !== user.email) {
    const { error } = await authClient.changeEmail({
      newEmail: values.email,
      callbackURL: "/profile",
    })
    if (error?.code === "COULDNT_UPDATE_YOUR_EMAIL") {
      hasError = true
      knownMails.push(values.email)
      form.validate()
    }
  }

  open.value = hasError
  loading.value = false
})
</script>

<template>
  <Dialog
    :open="open"
    @update:open="openForm"
  >
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Nutzername oder E-Mail ändern</DialogTitle>
        <DialogDescription>
          Ändere deinen Nutzernamen oder deine E-Mail Adresse.
        </DialogDescription>
      </DialogHeader>
      <form
        class="grid gap-4"
        @submit="onSubmit"
      >
        <FormField
          v-slot="{ componentField }"
          name="username"
        >
          <FormItem>
            <FormLabel>Nutzername</FormLabel>
            <FormControl>
              <Input
                id="username"
                :default-value="user.username"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField
          v-slot="{ componentField }"
          name="email"
        >
          <FormItem>
            <FormLabel>E-Mail</FormLabel>
            <FormControl>
              <Input
                id="email"
                :default-value="user.email"
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
          @click="onSubmit"
        >
          Speichern
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
