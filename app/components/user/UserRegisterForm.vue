<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { z } from "zod"

const loading = ref(false)
const knownMails: string[] = []

const schema = userRegisterSchemaWithRepeatValidatePassword.and(
  z.object({
    email: emailSchema.email.refine(
      value => !knownMails.includes(value),
      { message: "Es existiert bereits ein Account mit dieser E-Mail." },
    ),
  }),
)

const formSchema = toTypedSchema(schema)
const form = useForm({ validationSchema: formSchema })

const onSubmit = form.handleSubmit(async (values) => {
  if (loading.value) return
  loading.value = true
  const data = {
    email: values.email,
    name: values.name,
    password: values.password,
  }

  const { error } = await authClient.signUp.email(data)
  if (error) {
    if (error.code === "USER_ALREADY_EXISTS") {
      knownMails.push(values.email)
      form.validate()
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
      name="name"
    >
      <FormItem>
        <FormLabel>Nutzername</FormLabel>
        <FormControl>
          <Input
            id="name"
            v-bind="componentField"
            type="text"
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
    <FormField
      v-slot="{ componentField }"
      name="confirmPassword"
    >
      <FormItem>
        <FormLabel>Passwort wiederholen</FormLabel>
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
    <FormField
      v-slot="{ value, handleChange }"
      type="checkbox"
      name="acceptedTermsOfService"
    >
      <FormItem class="flex flex-row items-start gap-x-3 space-y-0">
        <FormControl>
          <Checkbox
            :checked="value"
            @update:checked="handleChange"
          />
        </FormControl>
        <div class="space-y-1 leading-none">
          <FormLabel>
            Ich akzeptiere die
            <NuxtLink
              to="/legal/terms-of-service"
              class="underline"
            >Nutzungsbedingungen</NuxtLink>.
          </FormLabel>
        </div>
      </FormItem>
    </FormField>
    <Button
      :loading="loading"
      type="submit"
    >
      Registrieren
    </Button>
  </form>
</template>

<style>

</style>
