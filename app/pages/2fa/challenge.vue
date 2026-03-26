<script setup lang="ts">
import { useToast } from "@/components/ui/toast/use-toast"

definePageMeta({
  title: "Zwei-Faktor-Authentifizierung",
  description: "Bestätige deine Anmeldung",
})

const { toast } = useToast()
const loading = ref(false)
const code = ref("")
const hasError = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const isRecoveryCode = computed(() => /^[A-Z0-9]{5}-[A-Z0-9]{5}$/.test(code.value))
const isTotp = computed(() => /^\d{6}$/.test(code.value))

const hint = computed(() => {
  if (loading.value) return null
  if (hasError.value) return "Ungültiger Code – bitte erneut versuchen."
  if (code.value.length === 0) return null
  return isTotp.value || isRecoveryCode.value
    ? "Code bereit"
    : isRecoveryCode.value ? "Wiederherstellungscode erkannt" : `${code.value.length} / 6 Ziffern`
})

watch(code, (newVal) => {
  if (loading.value) return

  if (/^\d{6}$/.test(newVal) || /^[A-Z0-9]{5}-[A-Z0-9]{5}$/.test(newVal)) {
    submit()
  }
})

function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  hasError.value = false
  let raw = el.value.toUpperCase().replace(/[^A-Z0-9]/g, "")

  if (/^\d+$/.test(raw)) {
    // TOTP Path
    code.value = raw.slice(0, 6)
  } else {
    // Recovery Path: Format XXXXX-XXXXX
    if (raw.length > 5) {
      raw = `${raw.slice(0, 5)}-${raw.slice(5, 10)}`
    }
    code.value = raw.slice(0, 11)
  }

  el.value = code.value
}

async function submit() {
  if (loading.value) return

  loading.value = true
  try {
    const body = isTotp.value ? { code: code.value } : { recovery: code.value }
    const res = await $fetch<{ verified: boolean }>("/api/2fa/challenge", {
      method: "POST",
      body,
    })

    if (res.verified) {
      const statusState = useState<TwoFactorStatus | null>("2fa-status")
      if (statusState.value) {
        statusState.value = { ...statusState.value, verified: true }
      }

      await followRedirect(statusState.value)
      toast({
        title: "Identität bestätigt",
        description: "Zwei-Faktor-Authentifizierung erfolgreich abgeschlossen.",
        variant: "success",
      })
    }
  } catch {
    hasError.value = true
    code.value = ""
    toast({
      title: "Überprüfung fehlgeschlagen",
      description: "Bitte versuche es erneut.",
      variant: "destructive",
    })
    await nextTick(() => inputRef.value?.focus())
  } finally {
    loading.value = false
  }
}

onMounted(() => nextTick(() => inputRef.value?.focus()))
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-sm space-y-6">
      <div class="text-center space-y-3">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Icon
            name="heroicons:shield-check"
            class="w-7 h-7 text-primary"
          />
        </div>
        <div>
          <h1 class="text-xl font-semibold tracking-tight">
            Bestätigung erforderlich
          </h1>
          <p class="text-sm text-muted-foreground mt-1">
            Code aus deiner Authenticator-App oder Wiederherstellungscode eingeben
          </p>
        </div>
      </div>

      <Card class="shadow-sm">
        <CardContent class="pt-6 pb-6 px-6 space-y-4">
          <div class="space-y-2">
            <input
              ref="inputRef"
              :value="code"
              placeholder="000000 oder ABCDE-12345"
              maxlength="11"
              autocomplete="one-time-code"
              inputmode="numeric"
              :class="[
                'w-full h-14 rounded-lg border bg-background px-4 text-center font-mono text-xl tracking-[0.25em] outline-none transition-all duration-150',
                'placeholder:text-muted-foreground/40 placeholder:text-sm placeholder:tracking-normal',
                'focus:ring-2 focus:ring-offset-2',
                hasError
                  ? 'border-destructive focus:ring-destructive/40 text-destructive'
                  : 'border-input focus:ring-ring',
              ]"
              @input="onInput"
              @keydown.enter.prevent="submit"
            >

            <div class="h-4 flex items-center justify-between px-0.5">
              <p
                :class="[
                  'text-[11px] transition-opacity duration-150',
                  hasError ? 'text-destructive' : 'text-muted-foreground',
                  hint ? 'opacity-100' : 'opacity-0',
                ]"
              >
                {{ hint ?? '&nbsp;' }}
              </p>
              <div
                v-if="loading"
                class="flex items-center gap-1 text-[11px] text-muted-foreground"
              >
                <Icon
                  name="lucide:loader-2"
                  class="w-3 h-3 animate-spin"
                />
                Wird überprüft …
              </div>
            </div>
          </div>

          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <Button
              v-if="isRecoveryCode"
              class="w-full"
              :disabled="loading || code.length < 11"
              @click="submit"
            >
              <Icon
                v-if="loading"
                name="lucide:loader-2"
                class="w-4 h-4 mr-2 animate-spin"
              />
              Bestätigen
            </Button>
          </Transition>
        </CardContent>
      </Card>

      <p class="text-center text-xs text-muted-foreground">
        Kein Zugriff mehr?
        <NuxtLink
          to="/reset-password"
          class="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          Passwort zurücksetzen
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
