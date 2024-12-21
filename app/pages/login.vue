<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

definePageMeta({
  title: "Login",
  description: "Login to your account",
  layout: "auth",
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
      <UserLoginForm />
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
