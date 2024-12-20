<script lang="ts" setup>
import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"

const loading = ref(false)
const open = ref(false)

const formSchema = toTypedSchema(userUpdatePasswordValidateSchema)
const form = useForm({ validationSchema: formSchema })

const onSubmit = form.handleSubmit(async (values) => {
  if (loading.value) return
  loading.value = true
  let hasError = false

  const { error } = await authClient.changePassword({
    newPassword: values.password,
    currentPassword: values.oldPassword,
    revokeOtherSessions: true,
  })

  if (error?.code === "INVALID_PASSWORD") {
    hasError = true
    form.setFieldError("oldPassword", "Das Passwort ist falsch.")
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
    <DialogContent class="max-w-[425px]">
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
