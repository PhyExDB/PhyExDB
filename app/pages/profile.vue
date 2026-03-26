<script setup lang="ts">
import UserDeleteAccountDialog from "~/components/user/UserDeleteAccountDialog.vue"
import getInitials from "~~/shared/utils/initials"
import { useToast } from "@/components/ui/toast/use-toast"
import TwoFactorSetup from "~/pages/2fa/TwoFactorSetup.vue"
import TwoFactorRecoveryDisplay from "~/pages/2fa/TwoFactorRecoveryDisplay.vue"

definePageMeta({
  title: "Profil",
  description: "Verwalte deine Kontoinformationen",
})
const user = await useUserOrThrowError()
const { toast } = useToast()
const { status: twofaStatus, setup, enable, disable, regenerateRecoveries, refreshStatus } = use2fa()

const { data: ownExperiments } = await useLazyFetch("/api/experiments/mine", {
  query: {
    pageSize: 0,
  },
})
const { data: experimentsToReview } = await useFetch("/api/experiments/in-review?pageSize=0")
const canReviewExperiments = await allows(experimentAbilities.review)

const emailVerifiedPopoverOpen = ref(false)
const twofaLoading = ref(false)
const qrLoading = ref(false)
const twofaSetupData = ref<{ secret: string, qrDataUrl: string } | null>(null)
const qrDataUrl = ref<string | null>(null)
const twofaCode = ref("")
const twofaRecoveryCodes = ref<string[] | null>(null)

if (!twofaStatus.value) {
  await refreshStatus()
}

const verifiedValue = computed(() => user.value?.emailVerified ? "verifiziert" : "nicht verifiziert")
const getExperimentText = (count: number) => count === 1 ? "1 Experiment" : `${count} Experimente`

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

async function startTwofaSetup() {
  qrLoading.value = true
  twofaLoading.value = true
  twofaRecoveryCodes.value = null
  try {
    const data = await setup()
    twofaSetupData.value = data
    qrDataUrl.value = data.qrDataUrl
  } catch {
    toast({
      title: "Setup fehlgeschlagen",
      description: "Es ist ein Fehler aufgetreten. Versuche es erneut.",
      variant: "destructive",
    })
  } finally {
    qrLoading.value = false
    twofaLoading.value = false
  }
}

async function confirmTwofaEnable() {
  if (!twofaCode.value) return
  twofaLoading.value = true
  try {
    const res = await enable(twofaCode.value)
    twofaRecoveryCodes.value = res.recoveryCodes || null
    twofaCode.value = ""

    toast({
      title: "2FA erfolgreich aktiviert",
      description: "Dein Konto ist jetzt durch einen zweiten Faktor geschützt. Bitte sichere deine Wiederherstellungscodes.",
      variant: "success",
    })
  } catch {
    toast({
      title: "Aktivierung fehlgeschlagen",
      description: "Der eingegebene Code ist ungültig oder abgelaufen.",
      variant: "destructive",
    })
  } finally {
    twofaLoading.value = false
  }
}

async function handleRegenerateCodes() {
  if (!twofaCode.value) return
  twofaLoading.value = true
  try {
    const res = await regenerateRecoveries(twofaCode.value)
    twofaRecoveryCodes.value = res.recoveryCodes || null
    twofaCode.value = ""
    toast({
      title: "Wiederherstellungscodes neu erzeugt",
      description: "Die neuen Codes wurden erfolgreich generiert.",
      variant: "success",
    })
  } catch {
    toast({
      title: "Fehler beim Generieren",
      description: "Bitte überprüfe deinen 2FA-Code.",
      variant: "destructive",
    })
  } finally {
    twofaLoading.value = false
  }
}

async function handleResetTwofa() {
  if (!twofaCode.value) {
    toast({
      title: "Fehler",
      description: "Bitte gib einen 2FA-Code oder Recovery-Code ein.",
      variant: "destructive",
    })
    return
  }

  twofaLoading.value = true
  try {
    await disable(twofaCode.value)
    twofaCode.value = ""
    twofaSetupData.value = null
    twofaRecoveryCodes.value = null
    toast({
      title: "2FA zurückgesetzt",
      description: "Du kannst nun ein neues Gerät einrichten.",
      variant: "success",
    })
    await startTwofaSetup()
  } catch {
    toast({
      title: "Deaktivierung fehlgeschlagen",
      description: "Der Code konnte nicht verifiziert werden.",
      variant: "destructive",
    })
  } finally {
    twofaLoading.value = false
  }
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
                <Popover v-model:open="emailVerifiedPopoverOpen">
                  <PopoverTrigger as-child>
                    <Icon
                      :name="user.emailVerified ? 'heroicons:check-badge' : 'heroicons:exclamation-circle'"
                      :class="user.emailVerified ? 'text-success-foreground' : 'text-destructive'"
                      size="1.2em"
                      class="cursor-pointer"
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
          Es gibt {{ getExperimentText(experimentsToReview?.pagination?.total ?? 0) }} zur Überprüfung.
        </p>
        <NuxtLink
          v-if="experimentsToReview?.pagination?.total"
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
          Du hast {{ getExperimentText(ownExperiments?.pagination?.total ?? 0) }} erstellt.
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
            v-if="!twofaSetupData"
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
              :setup="twofaSetupData"
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
                placeholder="000000 oder ABCDE-12345"
                maxlength="11"
                @keyup.enter="handleRegenerateCodes"
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
                @click="handleRegenerateCodes"
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
                @click="handleResetTwofa"
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
