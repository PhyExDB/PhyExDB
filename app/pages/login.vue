<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { userLoginSchema } from "~~/shared/types/User.type"

definePageMeta({
  title: "Login",
  description: "Login to your account",
  layout: "auth",
})

const loading = ref(false)

const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const formSchema = toTypedSchema(userLoginSchema)
const form = useForm({ validationSchema: formSchema })

const onSubmit = form.handleSubmit(async (values) => {
  if (loading.value) return
  loading.value = true
  console.log("hi", values)
  const { error } = await authClient.signIn.email(values)
  if (error) {
    console.log(error)
    // toast.add({
    //   title: error.message,
    //   color: 'red',
    // })
  } else {
    await navigateTo("/user")
    // toast.add({
    //   title: `You have been signed in!`,
    // })
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
        class="w-2/3 space-y-6"
        @submit="onSubmit"
      >
        <FormField
          v-slot="{ componentField }"
          name="email"
        >
          <FormItem>
            <FormLabel>E-mail</FormLabel>
            <FormControl>
              <Input
                id="email"
                v-bind="componentField"
                type="email"
                required
              />
            </FormControl>
            <!-- <FormDescription>
              This is your public display name.
            </FormDescription> -->
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
                required
              />
            </FormControl>
            <!-- <FormDescription>
              This is your public display name.
            </FormDescription> -->
            <FormMessage />
          </FormItem>
        </FormField>
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
