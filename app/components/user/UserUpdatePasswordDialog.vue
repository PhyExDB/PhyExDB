<script lang="ts" setup>
import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { useToast } from "@/components/ui/toast/use-toast"

const loading = ref(false)
const open = ref(false)

const formSchema = toTypedSchema(userUpdatePasswordValidateSchema)
const form = useForm({ validationSchema: formSchema })

const { toast } = useToast()
const onSubmit = form.handleSubmit(async (values) => {
  if (loading.value) return
  loading.value = true
  let hasError = false

  const { error } = await useAuth().client.changePassword({
    newPassword: values.password,
    currentPassword: values.oldPassword,
    revokeOtherSessions: true,
  })

  if (error?.code === "INVALID_PASSWORD") {
    hasError = true
    form.setFieldError("oldPassword", "Das Passwort ist falsch")
  }

  if (!hasError) {
    toast({
      title: "Passwort geändert",
      description: "Dein Passwort wurde erfolgreich geändert.",
      variant: "success",
    })
    open.value = false
  }

  open.value = hasError
  loading.value = false
})
</script>

<template>
  <Dialog
    :open="open"
    @update:open="open = $event"
  >
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>
    <DialogContent class="max-w-[425px] max-h-full overflow-auto">
      <DialogHeader>
        <DialogTitle>Passwort ändern</DialogTitle>
        <DialogDescription>
          Ändere dein Passwort.
        </DialogDescription>
      </DialogHeader>
      <form
        class="grid gap-4"
        @submit="onSubmit"
      >
        <FormField
          v-slot="{ componentField }"
          name="oldPassword"
        >
          <FormItem>
            <FormLabel>Aktuelles Passwort</FormLabel>
            <FormControl>
              <Input
                id="oldPassword"
                v-bind="componentField"
                type="password"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="password"
          :validate-on-input="true"
        >
          <FormItem>
            <FormLabel>Neues Passwort</FormLabel>
            <FormControl>
              <Input
                id="password"
                v-bind="componentField"
                type="password"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField
          v-slot="{ componentField }"
          name="confirmPassword"
        >
          <FormItem>
            <FormLabel>Neues Passwort wiederholen</FormLabel>
            <FormControl>
              <Input
                id="confirmPassword"
                v-bind="componentField"
                type="password"
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
