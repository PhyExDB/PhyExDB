<script setup lang="ts">
import { Html, Button } from "@vue-email/components"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
definePageMeta({
  title: "Reset Password",
  description: "Reset your password",
  layout: "auth",
})

const user = await useUser()
if (user.value) {
  followRedirect()
}
</script>

<template>
  <Card class="max-w-sm w-full">
    <CardHeader>
      <CardTitle class="text-2xl">
        Passwort zurücksetzen
      </CardTitle>
      <CardDescription>
        Gib deine E-Mail Adresse ein.
      </CardDescription>
    </CardHeader>
    <CardContent class="grid gap-4">
      <div class="text-center text-sm">
        Noch kein Account?
        <NuxtLink
          href="/register"
          class="underline"
        >
          Registrieren
        </NuxtLink>
      </div>
    </CardContent>
  </Card>
</template>
