<script lang="ts" setup>
import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { z } from "zod"
import { useToast } from "@/components/ui/toast/use-toast"

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

const { toast } = useToast()
const onSubmit = form.handleSubmit(async (values) => {
  if (loading.value) return
  loading.value = true
  let hasError = false

  // Do not put this in an if and only update when changed
  // because then the email update is not displayed when the
  // email is changed directly because the current email was
  // not verified.
  await useAuth().client.updateUser({
    name: values.name,
  })

  if (values.email !== user.email) {
    const { error } = await useAuth().client.changeEmail({
      newEmail: values.email,
      callbackURL: "/profile",
    })
    if (error?.code === "COULDNT_UPDATE_YOUR_EMAIL") {
      hasError = true
      knownMails.push(values.email)
      form.validate()
    }
  }

  if (!hasError) {
    toast({
      title: "Account aktualisiert",
      description: "Dein Account wurde erfolgreich aktualisiert.",
      variant: "success",
    })
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
    <DialogContent class="max-w-[425px] max-h-full overflow-auto">
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
          name="name"
        >
          <FormItem>
            <FormLabel>Nutzername</FormLabel>
            <FormControl>
              <Input
                id="name"
                :default-value="user.name"
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
        <Alert v-if="user.emailVerified">
          <div class="flex items-start">
            <Icon
              name="heroicons:information-circle"
              class="w-4 h-4 mr-2 shrink-0"
            />
            <div>
              <AlertTitle>E-Mail Änderung</AlertTitle>
              <AlertDescription>
                Die Änderung der E-Mail Adresse muss zunächst
                über die bisherige E-Mail Adresse bestätigt werden,
                bevor sie wirksam wird.
              </AlertDescription>
            </div>
          </div>
        </Alert>
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
