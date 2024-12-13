<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

definePageMeta({
  title: "Sign Up",
  description: "Sign up for a new account",
  layout: "auth",
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
      <div class="grid gap-2">
        <Label for="email">E-Mail</Label>
        <Input
          id="email"
          type="email"
          required
        />
      </div>
      <div class="grid gap-2">
        <Label for="email">Nutzername</Label>
        <Input
          id="email"
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
        Registrieren
      </Button>
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
