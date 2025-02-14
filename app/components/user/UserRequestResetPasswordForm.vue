<script lang="ts" setup>
import { useForm } from "vee-validate"
import { z } from "zod"
import { toTypedSchema } from "@vee-validate/zod"
import { useToast } from "@/components/ui/toast/use-toast"

const loading = ref(false)

const formSchema = toTypedSchema(z.object(emailSchema))

const form = useForm({ validationSchema: formSchema })

const { toast } = useToast()
const onSubmit = form.handleSubmit(async (values) => {
  if (loading.value) return
  loading.value = true

  const { error } = await useAuth().client.forgetPassword({
    email: values.email,
    redirectTo: "/reset-password",
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
      title: "Link gesendet",
      description: "Dein Link zum Zurücksetzen des Passworts wurde gesendet",
      variant: "success",
    })
  }

  form.resetForm()
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
      name="email"
    >
      <FormItem>
        <FormLabel>Deine E-Mail</FormLabel>
        <FormControl>
          <Input
            id="email"
            v-bind="componentField"
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
    Link zum Zurücksetzen anfordern
  </Button>
</template>
