<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { z } from "zod"
import { authClient } from "../utils/authClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { userRegisterSchemaWithRepeatValidatePassword } from "~~/shared/types/User.type"

definePageMeta({
  title: "Sign Up",
  description: "Sign up for a new account",
  layout: "auth",
})

const loading = ref(false)
const knownMails: string[] = []

const schema = userRegisterSchemaWithRepeatValidatePassword.and(
  z.object({
    email: z.string().refine(
      value => !knownMails.includes(value),
      { message: "Es existiert bereist ein Account mit dieser E-Mail." },
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
    name: values.username,
    password: values.password,
  }

  console.log("signup: ", values)

  const { error } = await authClient.signUp.email(data)
  if (error) {
    if (error.code === "USER_ALREADY_EXISTS") {
      knownMails.push(values.email)
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
  <Card class="max-w-sm w-full">
    <CardHeader>
      <CardTitle class="text-2xl">
        Registrieren
      </CardTitle>
      <CardDescription>
        Gib deine E-Mail Adresse an und lege deinen Benutzernamen und dein Passwort fest.
      </CardDescription>
    </CardHeader>
    <CardContent class="grid gap-4">
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
          name="username"
        >
          <FormItem>
            <FormLabel>Nutzername</FormLabel>
            <FormControl>
              <Input
                id="username"
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
        <Button
          :loading="loading"
          type="submit"
        >
          Registrieren
        </Button>
      </form>
      <div class="text-center text-sm">
        Bereits registriert?
        <NuxtLink
          href="/login"
          class="underline"
        >
          Anmelden
        </NuxtLink>
      </div>
    </CardContent>
  </Card>
</template>
