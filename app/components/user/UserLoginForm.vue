<script lang="ts" setup>
import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"

const loading = ref(false)
const lastWrong = ref(false)

const formSchema = toTypedSchema(userLoginSchema)
const form = useForm({ validationSchema: formSchema })

const onSubmit = form.handleSubmit(async (values) => {
  if (loading.value) return
  loading.value = true

  console.log("signin: ", values)

  const { error } = await authClient.signIn.email(values)
  if (error) {
    if (error.code === "INVALID_EMAIL_OR_PASSWORD") {
      lastWrong.value = true
      form.validate()
    } else {
      console.log(error)
    }
  } else {
    await navigateTo("/user")
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
            type="email"
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
      class="text-destructive text-sm"
    >
      Falsche E-Mail oder Passwort
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
