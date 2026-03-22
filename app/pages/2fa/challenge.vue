<script setup lang="ts">
import { useToast } from "@/components/ui/toast/use-toast"

definePageMeta({
  title: "Zwei-Faktor-Authentifizierung",
  description: "Bestätige deine Anmeldung",
})

const { toast } = useToast()
const route = useRoute()
const loading = ref(false)
const twoFactorAuthCode = ref("")

async function submitChallenge() {
  if (loading.value || !twoFactorAuthCode.value.trim()) return
  loading.value = true

  const input = twoFactorAuthCode.value.trim().toUpperCase()
  const isTotp = /^\d{6}$/.test(input)
  const isRecovery = /^[A-Z0-9]{5}-[A-Z0-9]{5}$/.test(input)

  if (!isTotp && !isRecovery) {
    toast({
      title: "Ungültiges Format",
      description: "Bitte gib entweder einen 6-stelligen Code oder einen gültigen Wiederherstellungscode (z. B. ABCDE-12345) ein.",
      variant: "destructive",
    })
    loading.value = false
    return
  }

  try {
    const body = isTotp ? { code: input } : { recovery: input }

    const res = await $fetch("/api/2fa/challenge", {
      method: "POST",
      body,
    })

    if (res.verified) {
      const statusState = useState<TwoFactorStatus | null>("2fa-status")
      if (statusState.value) {
        statusState.value = { ...statusState.value, verified: true }
      }

      const target = route.query.redirect?.toString() || "/"
      await navigateTo(target, { replace: true })
      toast({
        title: "Identität bestätigt",
        description: "Zwei-Faktor-Authentifizierung erfolgreich abgeschlossen.",
        variant: "success",
      })
    }
  } catch {
    toast({
      title: "Überprüfung fehlgeschlagen",
      description: "Bitte versuche es erneut.",
      variant: "destructive",
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md w-full mx-auto pt-20">
    <Card class="border-2 shadow-lg">
      <CardHeader>
        <CardTitle class="text-2xl">
          2FA erforderlich
        </CardTitle>
        <CardDescription>
          Sicherheitscode aus deiner App oder Wiederherstellungsschlüssel eingeben.
        </CardDescription>
      </CardHeader>

      <CardContent class="grid gap-4">
        <div class="space-y-2">
          <Label for="2fa-code">Code / Key</Label>
          <Input
            id="2fa-code"
            v-model="twoFactorAuthCode"
            placeholder="123456 oder ABCDE-12345"
            class="font-mono text-lg h-12 tracking-widest text-center"
            maxlength="11"
            autofocus
            @keydown.enter.prevent="submitChallenge"
          />
        </div>

        <Button
          :loading="loading"
          class="w-full h-11 text-lg"
          @click="submitChallenge"
        >
          Bestätigen
        </Button>
      </CardContent>
    </Card>
  </div>
</template>
