<script setup lang="ts">
import { useToast } from "@/components/ui/toast/use-toast"

definePageMeta({
  title: "Zwei-Faktor-Authentifizierung",
  description: "Bestätige deine Anmeldung",
})

const { toast } = useToast()
const loading = ref(false)
const twoFactorAuthCode = ref("")

onMounted(async () => {
  const { data } = await useFetch("/api/2fa/status")
  if (!data.value?.enabled || !data.value?.required) {
    followRedirect()
  }
})

async function submitChallenge() {
  if (loading.value || !twoFactorAuthCode.value.trim()) return
  loading.value = true

  try {
    const input = twoFactorAuthCode.value.trim().toUpperCase()
    const isTotp = /^\d{6}$/.test(input)
    const isRecovery = /^[A-Z0-9]{5}-[A-Z0-9]{5}$/.test(input)

    const body = isTotp
      ? { code: input }
      : isRecovery
        ? { recovery: input }
        : null

    if (!body) {
      toast({
        title: "Ungültiges Format",
        description: "Bitte gib entweder einen 6-stelligen Code oder einen gültigen Wiederherstellungscode (z. B. ABCDE-12345) ein.",
        variant: "destructive",
      })
      loading.value = false
      return
    }

    const { data } = await useFetch("/api/2fa/challenge", {
      method: "POST",
      body,
    })

    if (data.value?.verified) {
      followRedirect()
    } else {
      toast({
        title: "Ungültiger Code",
        description: "Bitte versuche es erneut.",
        variant: "destructive",
      })
    }
  } catch (e) {
    console.error(e);
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
  <div class="max-w-md w-full mx-auto">
    <Card>
      <CardHeader>
        <CardTitle>2FA erforderlich</CardTitle>
        <CardDescription>
          Gib deinen 6-stelligen Authenticator-Code oder deinen Wiederherstellungscode ein.
        </CardDescription>
      </CardHeader>

      <CardContent class="grid gap-4">
        <FormField v-slot="{ componentField }"
                   name="2faInput">
          <FormItem>
            <FormLabel>Code</FormLabel>
            <FormControl>
              <Input
                v-model="twoFactorAuthCode"
                v-bind="componentField"
                placeholder="123456 oder ABCDE-12345"
                inputmode="text"
                maxlength="11"
                @keydown.enter.prevent="submitChallenge"
              />
            </FormControl>
          </FormItem>
        </FormField>

        <Button :loading="loading" @click="submitChallenge">
          Bestätigen
        </Button>
      </CardContent>
    </Card>
  </div>
</template>
