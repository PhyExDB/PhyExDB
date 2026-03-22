<script setup lang="ts">
import { useToast } from "@/components/ui/toast/use-toast"
import TwoFactorRecoveryDisplay from "~/pages/2fa/TwoFactorRecoveryDisplay.vue"

definePageMeta({
  title: "2FA einrichten",
  layout: "auth",
})

const { toast } = useToast()
const step = ref<"setup" | "codes">("setup")
const qrLoading = ref(true)
const qrDataUrl = ref<string | null>(null)
const secret = ref<string | null>(null)
const twofaCode = ref("")
const recoveryCodes = ref<string[] | null>(null)
const enabling = ref(false)
const secretVisible = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const codeError = ref(false)

onMounted(async () => {
  try {
    const data = await $fetch("/api/2fa/setup")
    qrDataUrl.value = data.qrDataUrl
    secret.value = data.secret
  } catch {
    toast({
      title: "Fehler",
      description: "Setup fehlgeschlagen.",
      variant: "destructive",
    })
  } finally {
    qrLoading.value = false
    await nextTick(() => inputRef.value?.focus())
  }
})

function onCodeInput(e: Event) {
  const digits = (e.target as HTMLInputElement).value.replace(/\D/g, "").slice(0, 6)
  twofaCode.value = digits
  ;(e.target as HTMLInputElement).value = digits
  codeError.value = false
  if (digits.length === 6) confirmEnable()
}

async function confirmEnable() {
  if (twofaCode.value.length < 6 || enabling.value) return
  enabling.value = true
  codeError.value = false
  try {
    const res = await $fetch<{ recoveryCodes: string[] }>("/api/2fa/enable", {
      method: "POST",
      body: { code: twofaCode.value },
    })
    recoveryCodes.value = res.recoveryCodes
    step.value = "codes"
  } catch {
    codeError.value = true
    twofaCode.value = ""
    toast({
      title: "Ungültiger Code",
      description: "Bitte versuche es erneut.",
      variant: "destructive",
    })
    await nextTick(() => inputRef.value?.focus())
  } finally {
    enabling.value = false
  }
}

async function finishSetup() {
  clearNuxtData()
  await navigateTo("/profile", { replace: true })
}

async function copySecret() {
  if (!secret.value) return
  await navigator.clipboard.writeText(secret.value)
  toast({ title: "Secret kopiert", variant: "success" })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md space-y-6">
      <div class="text-center space-y-3">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Icon
            name="heroicons:shield-check"
            class="w-7 h-7 text-primary"
          />
        </div>
        <div>
          <h1 class="text-xl font-semibold tracking-tight">
            Zwei-Faktor-Authentifizierung einrichten
          </h1>
          <p class="text-sm text-muted-foreground mt-1">
            Schütze deinen Account mit einem zweiten Faktor
          </p>
        </div>
      </div>

      <!-- Step indicator -->
      <div class="flex items-center gap-3 px-2">
        <div class="flex items-center gap-2 flex-1">
          <div
            :class="[
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
              step === 'setup'
                ? 'bg-primary text-primary-foreground'
                : 'bg-primary/20 text-primary',
            ]"
          >
            <Icon
              v-if="step === 'codes'"
              name="heroicons:check"
              class="w-3.5 h-3.5"
            />
            <span v-else>1</span>
          </div>
          <span class="text-sm font-medium">App verknüpfen</span>
        </div>
        <div class="h-px flex-1 bg-border" />
        <div class="flex items-center gap-2 flex-1 justify-end">
          <span
            :class="['text-sm font-medium', step === 'codes' ? '' : 'text-muted-foreground']"
          >
            Codes sichern
          </span>
          <div
            :class="[
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
              step === 'codes'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            ]"
          >
            2
          </div>
        </div>
      </div>

      <Card
        v-if="step === 'setup'"
        class="shadow-sm"
      >
        <CardContent class="pt-6 pb-6 px-6 space-y-6">
          <!-- QR Code -->
          <div class="flex flex-col items-center gap-4">
            <div class="bg-white p-3 rounded-xl border shadow-sm">
              <div
                v-if="qrLoading"
                class="w-44 h-44 flex items-center justify-center"
              >
                <Icon
                  name="lucide:loader-2"
                  class="w-8 h-8 animate-spin text-muted-foreground"
                />
              </div>
              <img
                v-else-if="qrDataUrl"
                :src="qrDataUrl"
                alt="QR Code"
                class="w-44 h-44"
              >
            </div>
            <p class="text-xs text-muted-foreground text-center">
              Scanne den QR-Code mit Google Authenticator oder einer anderen TOTP-App.
            </p>
          </div>

          <!-- Manual secret -->
          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Manuelles Secret
            </p>
            <div class="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
              <span class="font-mono text-sm flex-1 truncate select-all">
                {{ secretVisible ? secret : '••••••••••••••••' }}
              </span>
              <button
                type="button"
                class="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                @click="secretVisible = !secretVisible"
              >
                <Icon
                  :name="secretVisible ? 'heroicons:eye-slash' : 'heroicons:eye'"
                  class="w-4 h-4"
                />
              </button>
              <button
                type="button"
                class="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                @click="copySecret"
              >
                <Icon
                  name="heroicons:clipboard"
                  class="w-4 h-4"
                />
              </button>
            </div>
          </div>

          <Separator />

          <!-- Code entry -->
          <div class="space-y-3">
            <p class="text-sm font-medium">
              Code bestätigen
            </p>
            <input
              ref="inputRef"
              :value="twofaCode"
              placeholder="000000"
              maxlength="6"
              inputmode="numeric"
              autocomplete="one-time-code"
              :class="[
                'w-full h-12 rounded-lg border bg-background px-4 text-center font-mono text-2xl tracking-[0.4em] outline-none transition-colors',
                'focus:ring-2 focus:ring-ring focus:ring-offset-2',
                codeError
                  ? 'border-destructive focus:ring-destructive/40 text-destructive'
                  : 'border-input',
              ]"
              @input="onCodeInput"
              @keydown.enter.prevent="confirmEnable"
            >
            <p class="text-[11px] text-muted-foreground text-center">
              <template v-if="enabling">
                <span class="inline-flex items-center gap-1.5">
                  <Icon
                    name="lucide:loader-2"
                    class="w-3 h-3 animate-spin"
                  />
                  Wird überprüft...
                </span>
              </template>
              <template v-else>
                Code wird automatisch gesendet
              </template>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card
        v-if="step === 'codes'"
        class="shadow-sm"
      >
        <CardContent class="pt-6 pb-6 px-6 space-y-5">
          <div class="space-y-1">
            <p class="font-medium">
              Wiederherstellungscodes
            </p>
            <p class="text-sm text-muted-foreground">
              Speichere diese Codes, bevor du fortfährst.
            </p>
          </div>
          <TwoFactorRecoveryDisplay
            v-if="recoveryCodes"
            :codes="recoveryCodes"
          />
          <Button
            class="w-full"
            @click="finishSetup"
          >
            Einrichtung abschließen
            <Icon
              name="heroicons:arrow-right"
              class="w-4 h-4 ml-2"
            />
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
