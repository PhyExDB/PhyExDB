<script setup lang="ts">
import UserDeleteAccountDialog from "~/components/user/UserDeleteAccountDialog.vue"
import getInitials from "~~/shared/utils/initials"
import { useToast } from "@/components/ui/toast/use-toast"
import TwoFactorSetup from "~/pages/2fa/TwoFactorSetup.vue"
import TwoFactorRecoveryDisplay from "~/pages/2fa/TwoFactorRecoveryDisplay.vue"

definePageMeta({
  title: "Profile",
  description: "Change your information",
})
const user = await useUserOrThrowError()

const { data: ownExperiments } = await useLazyFetch("/api/experiments/mine", {
  query: {
    pageSize: 0,
  },
})
const { data: experimentsToReview } = await useFetch("/api/experiments/in-review?pageSize=0")

const emailVerifiedPopoverOpen = ref(false)

const verifiedValue = user.value?.emailVerified
  ? "verifiziert"
  : "nicht verifiziert"

const canReviewExperiments = await allows(experimentAbilities.review)

const { toast } = useToast()

async function sendVerificationEmail() {
  await useAuth().client.sendVerificationEmail({
    email: user.value!.email,
    callbackURL: "/profile",
  })
  toast({
    title: "E-Mail wurde versendet",
    description: "Bitte überprüfe deinen Posteingang",
    variant: "success",
  })
  emailVerifiedPopoverOpen.value = false
}

function numberOfExperimentsToReview(): string {
  const numberOfExperimentsToReview = experimentsToReview?.value?.pagination.total ?? 0
  return numberOfExperimentsToReview === 1
    ? "1 Experiment"
    : `${numberOfExperimentsToReview} Experimente`
}

function numberOfOwnExperiments(): string {
  const numberOfOwnExperiments = ownExperiments?.value?.pagination.total ?? 0
  return numberOfOwnExperiments === 1
    ? "1 Experiment"
    : `${numberOfOwnExperiments} Experimente`
}

const twofaStatus = ref<{ enabled: boolean }>({ enabled: false })
const twofaLoading = ref(false)
const twofaSetup = ref<{ secret: string, otpauthUrl: string, issuer: string } | null>(null)
const twofaCode = ref("")
const twofaRecoveryCodes = ref<string[] | null>(null)
const qrDataUrl = ref<string | null>(null)
const qrLoading = ref(false)

const { data: twofaStatusData } = await useFetch("/api/2fa/status")
if (twofaStatusData?.value) {
  twofaStatus.value = twofaStatusData.value
}

async function startTwofaSetup() {
  twofaLoading.value = true
  qrLoading.value = true
  twofaRecoveryCodes.value = null
  try {
    const { data } = await useFetch("/api/2fa/setup")
    if (data.value) {
      twofaSetup.value = data.value
      qrDataUrl.value = data.value.qrDataUrl
    }
  } catch (e: unknown) {
    let message = "Unbekannter Fehler"

    if (typeof e === "object" && e !== null) {
      const err = e as {
        message?: string
        data?: { message?: string }
      }

      if (err.data?.message) {
        message = err.data.message
      } else if (err.message) {
        message = err.message
      }
    }
    console.error(e)
    toast({
      title: "2FA-Einrichtung fehlgeschlagen",
      description: `${message} — bitte Migrationen ausführen und Session prüfen.`,
      variant: "destructive",
    })
  } finally {
    twofaLoading.value = false
    qrLoading.value = false
  }
}

async function confirmTwofaEnable() {
  if (!twofaCode.value) return
  twofaLoading.value = true
  try {
    const res = await $fetch("/api/2fa/enable", { method: "POST", body: { code: twofaCode.value } })
    if (res?.recoveryCodes) {
      twofaRecoveryCodes.value = res.recoveryCodes
      toast({
        title: "2FA aktiviert",
        description: "Die Zwei-Faktor-Authentifizierung wurde erfolgreich aktiviert.",
        variant: "success",
      })
      twofaCode.value = ""
      twofaStatus.value.enabled = true
    }
  } catch (e: unknown) {
    toast({ title: "2FA Error", description: getErrorMessage(e), variant: "destructive" })
  } finally {
    twofaLoading.value = false
  }
}

async function regenerateRecoveryCodes() {
  if (!twofaCode.value) return
  twofaLoading.value = true
  try {
    const res = await $fetch("/api/2fa/recoveries", { method: "POST", body: { code: twofaCode.value } })
    if (res?.recoveryCodes) {
      twofaRecoveryCodes.value = res.recoveryCodes
      toast({
        title: "Wiederherstellungscodes neu erzeugt",
        description: "Die neuen Codes wurden erfolgreich generiert.",
        variant: "success",
      })
      twofaCode.value = ""
    }
  } catch (e: unknown) {
    toast({ title: "2FA Error", description: getErrorMessage(e), variant: "destructive" })
  } finally {
    twofaLoading.value = false
  }
}

async function resetTwofa() {
  if (!twofaCode.value) {
    toast({ title: "Code erforderlich", description: "Bitte gib einen 2FA-Code oder Recovery-Code ein.", variant: "destructive" })
    return
  }

  twofaLoading.value = true
  try {
    await $fetch("/api/2fa/disable", {
      method: "POST",
      body: { code: twofaCode.value },
    })

    twofaStatus.value.enabled = false
    twofaSetup.value = null
    twofaRecoveryCodes.value = null
    twofaCode.value = ""

    toast({ title: "2FA zurückgesetzt", description: "Du kannst nun ein neues Gerät einrichten.", variant: "success" })

    await startTwofaSetup()
  } catch (e: unknown) {
    toast({ title: "Fehler", description: getErrorMessage(e), variant: "destructive" })
  } finally {
    twofaLoading.value = false
  }
}

function getErrorMessage(e: unknown, fallback = "Ungültiger Code"): string {
  if (typeof e !== "object" || e === null) return fallback

  const err = e as { message?: string, statusMessage?: string, data?: { message?: string, statusMessage?: string } }

  return err.data?.statusMessage
    ?? err.statusMessage
    ?? err.data?.message
    ?? err.message
    ?? fallback
}
</script>

<template>
  <div v-if="user">
    <!-- Profile -->
    <Card>
      <CardContent class="p-6">
        <div class="flex items-center flex-col sm:flex-row">
          <Avatar
            react
            class="w-24 h-24 mb-4 sm:mb-0 sm:mr-4 mx-auto"
          >
            <AvatarFallback class="text-xl font-bold">
              {{ getInitials(user.name) }}
            </AvatarFallback>
          </Avatar>
          <div class="flex-1">
            <div class="text-center sm:text-left">
              <div class="flex items-center justify-center sm:justify-start space-x-2">
                <p class="font-medium">
                  {{ user.name }}
                </p>
                <Badge
                  v-if="user.role !== 'USER'"
                  variant="outline"
                >
                  {{ capitalizeFirstLetter(user.role) }}
                </Badge>
              </div>
              <div class="flex items-center justify-center sm:justify-start space-x-2">
                <p class="text-muted-foreground">
                  {{ user.email }}
                </p>
                <Popover
                  :open="emailVerifiedPopoverOpen"
                  @update:open="emailVerifiedPopoverOpen = $event"
                >
                  <PopoverTrigger as-child>
                    <Icon
                      v-if="user.emailVerified"
                      size="1.2em"
                      class="text-success-foreground"
                      name="heroicons:check-badge"
                    />
                    <Icon
                      v-else
                      size="1.2em"
                      class="text-destructive"
                      name="heroicons:exclamation-circle"
                    />
                  </PopoverTrigger>
                  <PopoverContent class="w-auto">
                    <p class="text-sm text-muted-foreground px-1">
                      E-Mail ist {{ verifiedValue }}
                    </p>
                    <Button
                      v-if="!user.emailVerified"
                      variant="outline"
                      class="mt-3 w-full"
                      @click="sendVerificationEmail"
                    >
                      E-Mail verifizieren
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <div class="flex flex-col mt-4 sm:mt-0">
            <UserUpdateAccountDialog :user="user">
              <Button
                variant="outline"
                class="m-1 px-5 justify-center"
              >
                Name oder E-Mail ändern
              </Button>
            </UserUpdateAccountDialog>
            <UserUpdatePasswordDialog>
              <Button
                variant="outline"
                class="m-1 px-5 justify-center"
              >
                Passwort ändern
              </Button>
            </UserUpdatePasswordDialog>
            <UserDeleteAccountDialog>
              <Button
                variant="outline"
                class="m-1 px-5 justify-center"
              >
                Account löschen
              </Button>
            </UserDeleteAccountDialog>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Review Experiments -->
    <Card
      v-if="canReviewExperiments"
      class="mt-4"
    >
      <CardContent class="p-6 text-center sm:text-start">
        <div class="text-xl">
          Versuche überprüfen
        </div>
        <p class="text-muted-foreground mt-2">
          Es gibt {{ numberOfExperimentsToReview() }} zur Überprüfung.
        </p>
        <NuxtLink
          v-if="experimentsToReview?.items?.length"
          to="/experiments/review"
        >
          <Button
            class="mt-4"
            variant="outline"
          >
            Versuche überprüfen
          </Button>
        </NuxtLink>
      </CardContent>
    </Card>

    <!-- Own Experiments -->
    <Card class="mt-4">
      <CardContent class="p-6">
        <div class="text-xl">
          Meine Versuche
        </div>
        <p class="text-muted-foreground mt-2">
          Du hast {{ numberOfOwnExperiments() }} erstellt.
        </p>
        <NuxtLink
          to="/experiments/mine"
        >
          <Button
            class="mt-4"
            variant="outline"
          >
            Meine Versuche
          </Button>
        </NuxtLink>
      </CardContent>
    </Card>

    <Card class="mt-4">
      <CardContent class="p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="text-xl flex items-center gap-2">
            <Icon
              :name="twofaStatus.enabled ? 'heroicons:shield-check' : 'heroicons:shield-exclamation'"
              :class="twofaStatus.enabled ? 'text-success-foreground' : 'text-destructive'"
              size="1.2em"
            />
            Zwei-Faktor-Authentifizierung
          </div>
          <Badge
            :variant="twofaStatus.enabled ? 'outline' : 'destructive'"
            class="pointer-events-none select-none"
          >
            {{ twofaStatus.enabled ? 'Aktiviert' : 'Deaktiviert' }}
          </Badge>
        </div>

        <div
          v-if="!twofaStatus.enabled"
          class="space-y-4"
        >
          <p class="text-muted-foreground mt-2 text-sm">
            2FA ist für dein Konto verpflichtend. Bitte richte sie jetzt ein, um fortzufahren.
          </p>

          <div
            v-if="!twofaSetup"
            class="pt-2"
          >
            <Button
              :loading="twofaLoading"
              variant="outline"
              @click="startTwofaSetup"
            >
              <Icon
                name="heroicons:plus-circle"
                class="mr-2 h-4 w-4"
              />
              Einrichtung starten
            </Button>
          </div>

          <div
            v-else
            class="mt-6 border-t pt-6"
          >
            <TwoFactorSetup
              v-model:code="twofaCode"
              :setup="twofaSetup"
              :qr-url="qrDataUrl"
              :qr-loading="qrLoading"
              :loading="twofaLoading"
              @confirm="confirmTwofaEnable"
            />
          </div>
        </div>

        <div
          v-else
          class="space-y-6"
        >
          <p class="text-muted-foreground mt-2 text-sm italic">
            Dein Konto ist durch eine zusätzliche Sicherheitsebene geschützt.
          </p>

          <div class="grid gap-4 max-w-sm mt-4">
            <div class="space-y-2">
              <Label class="text-sm font-medium">Sicherheits-Bestätigung</Label>
              <Input
                v-model="twofaCode"
                class="font-mono text-center text-lg tracking-widest"
                placeholder="000000"
                maxlength="11"
                @keyup.enter="regenerateRecoveryCodes"
              />
              <p class="text-[10px] text-muted-foreground">
                Gib einen 2FA- oder Recovery-Code ein, um Änderungen vorzunehmen.
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                :disabled="!twofaCode || twofaLoading"
                @click="regenerateRecoveryCodes"
              >
                <Icon
                  name="heroicons:arrow-path"
                  class="mr-2 h-4 w-4"
                />
                Codes neu erzeugen
              </Button>
              <Button
                variant="outline"
                size="sm"
                class="text-destructive hover:bg-destructive/10"
                :disabled="!twofaCode || twofaLoading"
                @click="resetTwofa"
              >
                <Icon
                  name="heroicons:device-phone-mobile"
                  class="mr-2 h-4 w-4"
                />
                Gerät wechseln
              </Button>
            </div>
          </div>

          <TwoFactorRecoveryDisplay
            v-if="twofaRecoveryCodes"
            :codes="twofaRecoveryCodes"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Admin Actions -->
    <Card
      v-if="user.role === 'ADMIN'"
      class="mt-4"
    >
      <CardContent class="p-6">
        <div class="text-xl">
          Administration
        </div>
        <div class="flex flex-wrap gap-4 mt-4">
          <NuxtLink to="/users">
            <Button variant="outline">
              Nutzerverwaltung
            </Button>
          </NuxtLink>
          <NuxtLink to="/admin/categories">
            <Button variant="outline">
              Kategorien verwalten
            </Button>
          </NuxtLink>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
