<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
      <div class="grid gap-2">
        <Label for="email">E-Mail oder Nutzername</Label>
        <Input
          id="email"
          type="email"
          required
        />
      </div>
      <div class="grid gap-2">
        <Label for="password">Passwort</Label>
        <Input
          id="password"
          type="password"
          required
        />
      </div>
      <Button class="w-full">
        Anmelden
      </Button>
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
