<script lang="ts" setup>
import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { useToast } from "@/components/ui/toast/use-toast"

const { token } = defineProps({
  token: {
    type: String,
    required: true,
  },
})
const loading = ref(false)

const formSchema = toTypedSchema(userResetPasswordValidateSchema)

const form = useForm({ validationSchema: formSchema })

const { toast } = useToast()
const onSubmit = form.handleSubmit(async (values) => {
  if (loading.value) return
  loading.value = true

  // Reset password with new password and token
  const { error } = await useAuth().client.resetPassword({
    newPassword: values.password,
    token,
  })

  if (error) {
    loading.value = false
    toast({
      title: "Fehler",
      description: "Es ist ein Fehler aufgetreten. Bitte versuche es erneut.",
      variant: "error",
    })
  } else {
    toast({
      title: "Passwort zurückgesetzt",
      description: "Du hast erfolgreich dein neues Passwort gesetzt.",
      variant: "success",
    })
    await navigateTo("/login")
  }

  loading.value = false
})
</script>

<template>
  <form
    class="grid gap-4 w-full"
    @submit="onSubmit"
  >
    <FormField
      v-slot="{ componentField }"
      name="password"
    >
      <FormItem>
        <FormLabel>Dein neues Passwort</FormLabel>
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

  <Button
    type="submit"
    @click="onSubmit"
  >
    Speichern
  </Button>
</template>
