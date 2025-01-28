<script lang="ts" setup>
import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"

const loading = ref(false)
const lastWrong = ref(false)
const lastBanned = ref(false)

const formSchema = toTypedSchema(userLoginSchema)
const form = useForm({ validationSchema: formSchema })

const onSubmit = form.handleSubmit(async (values) => {
  if (loading.value) return
  loading.value = true

  const { error } = await useAuth().client.signIn.email(values)
  if (error) {
    if (error.code === "INVALID_EMAIL_OR_PASSWORD") {
      lastWrong.value = true
      form.validate()
    } else if (error.status === 401) {
      lastBanned.value = true
    } else {
      console.error(error)
    }
  } else {
    await navigateTo("/profile")
  }
  loading.value = false
})
</script>

<template>
  <form
    class="grid gap-4"
    @submit="onSubmit"
  >
    <FormField
      v-slot="{ componentField }"
      name="email"
    >
      <FormItem>
        <FormLabel>E-Mail</FormLabel>
        <FormControl>
          <Input
            id="email"
            v-bind="componentField"
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
        <FormLabel>Passwort</FormLabel>
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
    <div
      v-if="lastWrong"
      class="text-destructive text-sm font-medium"
    >
      E-Mail oder Passwort falsch
    </div>
    <div
      v-if="lastBanned"
      class="text-destructive text-sm font-medium"
    >
      Account gesperrt
    </div>
    <Button
      loading="{loading}"
      type="submit"
    >
      Anmelden
    </Button>
  </form>
</template>

<style>

</style>
