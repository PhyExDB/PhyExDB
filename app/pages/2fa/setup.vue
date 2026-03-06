<script setup lang="ts">
import { useToast } from "@/components/ui/toast/use-toast"
import TwoFactorRecoveryDisplay from "~/pages/2fa/TwoFactorRecoveryDisplay.vue"

definePageMeta({
  title: "2FA einrichten",
  layout: "auth",
})

const { toast } = useToast()
const loading = ref(false)
const qrLoading = ref(true)
const qrDataUrl = ref<string | null>(null)
const secret = ref<string | null>(null)
const twofaCode = ref("")
const recoveryCodes = ref<string[] | null>(null)

onMounted(async () => {
  try {
    const data = await $fetch("/api/2fa/setup")
    qrDataUrl.value = data.qrDataUrl
    secret.value = data.secret
  } catch {
    toast({ title: "Fehler", description: "Setup fehlgeschlagen.", variant: "destructive" })
  } finally {
    qrLoading.value = false
  }
})

async function confirmEnable() {
  if (twofaCode.value.length < 6 || loading.value) return
  loading.value = true
  try {
    const res = await $fetch("/api/2fa/enable", { method: "POST", body: { code: twofaCode.value } })
    if (res?.recoveryCodes) {
      recoveryCodes.value = res.recoveryCodes
    }
  } catch {
    toast({ title: "Fehler", description: "Code ungültig.", variant: "destructive" })
  } finally {
    loading.value = false
  }
}

async function finishSetup() {
  clearNuxtData()
  await navigateTo("/profile", { replace: true })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-background">
    <Card class="w-full max-w-[450px] border-2 shadow-xl overflow-hidden">
      <CardHeader class="space-y-1 text-center border-b bg-muted/20 pb-8">
        <div class="flex justify-center mb-4">
          <div class="flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full">
            <Icon
              name="heroicons:shield-check"
              class="w-8 h-8 text-primary"
            />
          </div>
        </div>
        <CardTitle class="text-2xl font-bold tracking-tight">
          Sicherheit erhöhen
        </CardTitle>
        <CardDescription>2FA ist für dein Konto verpflichtend</CardDescription>
      </CardHeader>

      <CardContent class="pt-8">
        <div
          v-if="!recoveryCodes"
          class="space-y-6"
        >
          <div
            v-if="qrLoading"
            class="flex justify-center py-10"
          >
            <Icon
              name="heroicons:arrow-path"
              class="w-10 h-10 animate-spin text-muted-foreground"
            />
          </div>

          <div
            v-else
            class="space-y-6"
          >
            <div class="flex flex-col items-center space-y-4">
              <div class="bg-white p-3 rounded-xl border-2 shadow-inner">
                <img
                  :src="qrDataUrl!"
                  class="w-44 h-44"
                >
              </div>
              <div class="text-center w-full bg-muted/50 p-2 rounded border border-dashed">
                <p class="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                  Manuelles Secret
                </p>
                <code class="text-xs font-mono text-primary select-all">{{ secret }}</code>
              </div>
            </div>

            <div class="space-y-3">
              <Label class="text-xs font-bold uppercase tracking-widest text-center block">Bestätigungscode</Label>
              <Input
                v-model="twofaCode"
                placeholder="000 000"
                class="h-12 text-center text-2xl font-mono tracking-[0.3em]"
                maxlength="6"
                @keyup.enter="confirmEnable"
              />
              <Button
                class="w-full h-11"
                :loading="loading"
                :disabled="twofaCode.length < 6"
                @click="confirmEnable"
              >
                Aktivieren
              </Button>
            </div>
          </div>
        </div>

        <div
          v-else
          class="space-y-6"
        >
          <TwoFactorRecoveryDisplay :codes="recoveryCodes" />
          <Button
            class="w-full h-11"
            variant="default"
            @click="finishSetup"
          >
            Einrichtung abschließen
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
