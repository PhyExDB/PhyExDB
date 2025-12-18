<script setup lang="ts">
import UserDeleteAccountDialog from "~/components/user/UserDeleteAccountDialog.vue"
import getInitials from "~~/shared/utils/initials"
import { useToast } from "@/components/ui/toast/use-toast"

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

const twofaStatus = ref<{ enabled: boolean; required: boolean }>({enabled: false, required: false})
const twofaLoading = ref(false)
const twofaSetup = ref<{ secret: string; otpauthUrl: string; issuer: string } | null>(null)
const twofaCode = ref("")
const twofaRecoveryCodes = ref<string[] | null>(null)
const twofaDisableCode = ref("")
const qrDataUrl = ref<string | null>(null)
const qrLoading = ref(false)

const { data: twofaStatusData } = await useFetch("/api/2fa/status")
if (twofaStatusData?.value) {
  twofaStatus.value = twofaStatusData.value as any
}

async function startTwofaSetup() {
  twofaLoading.value = true
  qrLoading.value = true
  twofaRecoveryCodes.value = null
  try {
    const {data} = await useFetch("/api/2fa/setup")
    if (data.value) {
      twofaSetup.value = data.value as any
      qrDataUrl.value = data.value.qrDataUrl
    }
  } catch (e: any) {
    console.error(e)
    toast({
      title: "2FA-Einrichtung fehlgeschlagen",
      description: (e?.data?.message || e?.message || "Unbekannter Fehler") + " — bitte Migrationen ausführen und Session prüfen.",
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
  } catch (e: any) {
    const message = e?.data?.statusMessage || e?.statusMessage || e?.data?.message || e?.message || "Invalid code"
    toast({ title: "2FA Error", description: message, variant: "destructive" })
  } finally {
    twofaLoading.value = false
  }
}

async function regenerateRecoveryCodes() {
  if (!twofaCode.value) return
  twofaLoading.value = true
  try {
    const res = await $fetch("/api/2fa/recoveries", {method: "POST", body: {code: twofaCode.value}})
    if (res?.recoveryCodes) {
      twofaRecoveryCodes.value = res.recoveryCodes
      toast({
        title: "Wiederherstellungscodes neu erzeugt",
        description: "Die neuen Codes wurden erfolgreich generiert.",
        variant: "success",
      })
      twofaCode.value = ""
    }
  } catch (e: any) {
    const message = e?.data?.statusMessage || e?.statusMessage || e?.data?.message || e?.message || "Invalid code or 2FA not enabled"
    toast( { title: "2FA Error", description: message, variant: "destructive" } )
  } finally {
    twofaLoading.value = false
  }
}

async function disableTwofa() {
  if (!twofaDisableCode.value) {
    toast({
      title: "Fehler",
      description: "Bitte gib den 2FA-Code ein",
      variant: "destructive",
    })
    return
  }

  twofaLoading.value = true
  try {
    await $fetch("/api/2fa/disable", {
      method: "POST",
      body: {code: twofaDisableCode.value}
    })
    twofaStatus.value.enabled = false
    twofaSetup.value = null
    twofaRecoveryCodes.value = null
    twofaCode.value = ""
    twofaDisableCode.value = ""

    toast({
      title: "2FA deaktiviert",
      description: "Die Zwei-Faktor-Authentifizierung wurde erfolgreich deaktiviert.",
      variant: "success",
    })
  } catch (e: any) {
    const message = e?.data?.statusMessage || e?.statusMessage || e?.data?.message || e?.message || "Ungültiger Code"
    toast({ title: "2FA Fehler", description: message, variant: "destructive",})
  } finally {
    twofaLoading.value = false
  }
}

function copyRecoveryCodes() {
  if (twofaRecoveryCodes.value && twofaRecoveryCodes.value.length > 0) {
    navigator.clipboard.writeText(twofaRecoveryCodes.value.join("\n"))
  } else {
    toast({
      title: "Keine Wiederherstellungscodes",
      description: "Es sind keine Wiederherstellungscodes verfügbar.",
      variant: "destructive",
    })
  }
}

function downloadRecoveryCodes() {
  if (!twofaRecoveryCodes.value || twofaRecoveryCodes.value.length === 0) return

  const blob = new Blob([twofaRecoveryCodes.value.join("\n")], {type: "text/plain"})
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "2fa-recovery-codes-" + process.env.APP_IMAGE + ".txt"
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div v-if="user">
    <!-- Profile -->
    <Card>
      <CardContent class="p-6">
        <div class="flex items-center flex-col sm:flex-row">
          <Avatar class="w-24 h-24 mb-4 sm:mb-0 sm:mr-4 mx-auto">
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
      <CardContent class="p-6 space-y-4">
        <div class="flex items-center space-x-2 text-xl">
          <span>🔒</span>
          <span>Zwei-Faktor-Authentifizierung</span>
          <span v-if="twofaStatus.enabled" class="text-green-600 text-xl">aktiviert</span>
          <span v-else class="text-red-600 text-xl">deaktiviert</span>
        </div>

        <!-- 2FA Disabled -->
        <div v-if="!twofaStatus.enabled" class="space-y-4">
          <div class="text-sm">2FA ist aktuell deaktiviert.</div>
          <Button :loading="twofaLoading" @click="startTwofaSetup">Einrichtung starten</Button>
          <div v-if="twofaSetup" class="space-y-3">
            <div class="text-sm">Scanne diesen QR-Code mit deiner Authenticator-App oder verwende das Secret.</div>
            <div class="flex items-center space-x-4">
              <div v-if="qrLoading" class="animate-spin w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
              <img v-else-if="qrDataUrl" :src="qrDataUrl" alt="QR" class="border rounded"/>
            </div>

            <div class="flex flex-col mt-2 text-xs">
              <div>
                <strong>Secret:</strong> {{ twofaSetup.secret }}
              </div>
            </div>
            <div class="grid gap-2 max-w-xs">
              <label class="text-sm font-medium">6-stelliger Code</label>
              <div class="flex space-x-2">
                <Input
                  class="h-10"
                  v-model="twofaCode"
                  placeholder="123456"
                  inputmode="numeric"
                  maxlength="6"
                  @keyup.enter="confirmTwofaEnable"
                />
                <Button class="h-10" :loading="twofaLoading" @click="confirmTwofaEnable">Bestätigen</Button>
              </div>
            </div>
          </div>

          <!-- Recovery Codes for newly enabled 2FA -->
          <div v-if="twofaRecoveryCodes" class="space-y-2">
            <div class="text-sm font-medium">Wiederherstellungscodes</div>
            <div class="text-xs text-yellow-600">
              Diese Codes werden nur einmal angezeigt. Bitte sicher speichern.
            </div>
            <ul class="text-sm grid grid-cols-2 gap-2">
              <li v-for="c in twofaRecoveryCodes" :key="c" class="font-mono p-2 border rounded">{{ c }}</li>
            </ul>
            <div class="flex space-x-2 mt-1">
              <Button size="sm" variant="outline" @click="copyRecoveryCodes">Kopieren</Button>
              <Button size="sm" variant="outline" @click="downloadRecoveryCodes">Als .txt speichern</Button>
            </div>
          </div>
        </div>

        <!-- 2FA Enabled -->
        <div v-else class="space-y-4">
          <div class="grid gap-2 max-w-xs">
            <label class="text-sm font-medium">Wiederherstellungscodes neu erzeugen</label>
            <div class="flex space-x-2">
              <Input
                class="h-10"
                v-model="twofaCode"
                placeholder="2FA-Code"
                inputmode="text"
                maxlength="11"
                @keyup.enter="regenerateRecoveryCodes"
              />
              <Button class="h-10" variant="outline" :loading="twofaLoading" @click="regenerateRecoveryCodes">
                Bestätigen
              </Button>
            </div>
          </div>
          <div v-if="twofaRecoveryCodes" class="space-y-2">
            <div class="text-sm font-medium">Neue Wiederherstellungscodes</div>
            <ul class="text-sm grid grid-cols-2 gap-2">
              <li v-for="c in twofaRecoveryCodes" :key="c" class="font-mono p-2 border rounded">{{ c }}</li>
            </ul>
            <div class="flex space-x-2 mt-1">
              <Button size="sm" variant="outline" @click="copyRecoveryCodes">Kopieren</Button>
              <Button size="sm" variant="outline" @click="downloadRecoveryCodes">Als .txt speichern</Button>
            </div>
          </div>
          <div class="grid gap-2 max-w-xs">
            <label class="text-sm font-medium">2FA deaktivieren</label>
            <div class="flex space-x-2">
              <Input
                class="h-10"
                v-model="twofaDisableCode"
                placeholder="2FA-Code"
                inputmode="text"
                maxlength="11"
                @keyup.enter="disableTwofa"
              />
              <Button class="h-10" variant="destructive" :loading="twofaLoading" @click="disableTwofa">Deaktivieren</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
