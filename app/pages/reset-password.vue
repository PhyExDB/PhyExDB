<script setup lang="ts">
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

// Get reset token from the url
const route = useRoute()
const token = route.query.token as string | undefined
</script>

<template>
  <Card class="max-w-sm w-full">
    <CardHeader>
      <CardTitle class="text-2xl">
        Passwort zurücksetzen
      </CardTitle>
      <CardDescription>
        {{ token? "Gib hier dein neues Passwort an und bestätige es anschließend." : "Gib deine E-Mail Adresse ein, um einen Link zum Zurücksetzen deines Passworts zu erhalten." }}
      </CardDescription>
    </CardHeader>
    <CardContent class="grid gap-4">
      <UserResetPasswordForm
        v-if="token"
        :token="token"
      />
      <UserRequestResetPasswordForm v-else />
      <div class="text-center text-sm">
        Du kennst dein Passwort?
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
