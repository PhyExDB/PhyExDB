<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { userLoginSchema } from "~~/shared/types/User.type"

definePageMeta({
  title: "Login",
  description: "Login to your account",
  layout: "auth",
})

const loading = ref(false)
const lastWrong = ref(false)

const schema = userLoginSchema

const formSchema = toTypedSchema(schema)
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
  <Card class="max-w-sm w-full">
    <CardHeader>
      <CardTitle class="text-2xl">
        Anmelden
      </CardTitle>
      <CardDescription>
        Gib deine E-Mail Adresse oder deinen Benutzernamen und dein Passwort ein.
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
          class="text-red-500 text-sm"
        >
          Falsche E-Mail oder Passwort
        </div>
        <Button
          loading="{loading}"
          type="submit"
        >
          Submit
        </Button>
      </form>
      <div class="text-center text-sm">
        Noch kein Account?
        <NuxtLink
          href="/sign-up"
          class="underline"
        >
          Registrieren
        </NuxtLink>
      </div>
    </CardContent>
  </Card>
</template>
