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
const twofaEnableCode = ref("")
const twofaRecoveryCodes = ref<string[] | null>(null)
const twofaDisableCode = ref("")

const { data: twofaStatusData } = await useFetch("/api/2fa/status")
if (twofaStatusData?.value) {
  twofaStatus.value = twofaStatusData.value as any
}

async function startTwofaSetup() {
  twofaLoading.value = true
  twofaRecoveryCodes.value = null
  try {
    const {data} = await useFetch("/api/2fa/setup")
    if (data.value) twofaSetup.value = data.value as any
  } catch (e: any) {
    console.error(e)
    toast({
      title: "2FA-Einrichtung fehlgeschlagen",
      description: (e?.data?.message || e?.message || "Unbekannter Fehler") + " — bitte Migrationen ausführen und Session prüfen.",
      variant: "destructive",
    })
  } finally {
    twofaLoading.value = false
  }
}

async function confirmTwofaEnable() {
  if (!twofaEnableCode.value) return
  twofaLoading.value = true
  try {
    const {data} = await useFetch("/api/2fa/enable", {method: "POST", body: {code: twofaEnableCode.value}})
    if (data.value?.recoveryCodes) {
      twofaRecoveryCodes.value = data.value.recoveryCodes
      twofaStatus.value.enabled = true
    }
  } catch (e) {
    console.error(e)
  } finally {
    twofaLoading.value = false
  }
}

async function regenerateRecoveryCodes() {
  if (!twofaEnableCode.value) return
  twofaLoading.value = true
  try {
    const {data} = await useFetch("/api/2fa/recoveries", {method: "POST", body: {code: twofaEnableCode.value}})
    if (data.value?.recoveryCodes) {
      twofaRecoveryCodes.value = data.value.recoveryCodes
    }
  } catch (e) {
    console.error(e)
  } finally {
    twofaLoading.value = false
  }
}

async function disableTwofa() {
  if (!twofaDisableCode.value) return
  twofaLoading.value = true
  try {
    await useFetch("/api/2fa/disable", {
      method: "POST",
      body: {code: twofaDisableCode.value || undefined}
    })
    twofaStatus.value.enabled = false
    twofaSetup.value = null
    twofaRecoveryCodes.value = null
    twofaEnableCode.value = ""
    twofaDisableCode.value = ""
  } catch (e) {
    console.error(e)
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
        <div class="text-xl">Sicherheit</div>
        <div class="text-muted-foreground">Zwei-Faktor-Authentifizierung</div>

        <div v-if="!twofaStatus.enabled" class="space-y-4">
          <div class="text-sm">2FA ist aktuell deaktiviert.</div>
          <div class="space-x-2">
            <Button :loading="twofaLoading" @click="startTwofaSetup">Einrichtung starten</Button>
          </div>
          <div v-if="twofaSetup" class="space-y-3">
            <div class="text-sm">Scanne diesen QR-Code mit deiner Authenticator-App oder verwende das Secret.</div>
            <div class="flex items-center space-x-4">
              <img
                  :src="`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(twofaSetup.otpauthUrl)}`"
                  alt="QR" class="border rounded"/>
              <div class="text-xs break-all">
                <div><strong>Secret:</strong> {{ twofaSetup.secret }}</div>
                <div class="mt-1"><a :href="twofaSetup.otpauthUrl" class="underline" target="_blank">otpauth URL
                  öffnen</a></div>
              </div>
            </div>
            <div class="grid gap-2 max-w-xs">
              <FormField name="securityCode" v-slot="{ componentField }">
                <FormItem>
                  <FormLabel>6-stelliger Code</FormLabel>
                  <FormControl>
                    <Input v-model="twofaEnableCode" v-bind="componentField" placeholder="123456" inputmode="numeric" maxlength="6"/>
                    <Button :loading="twofaLoading" @click="confirmTwofaEnable">2FA aktivieren</Button>
                  </FormControl>
                </FormItem>
              </FormField>
            </div>
          </div>

          <div v-if="twofaRecoveryCodes" class="space-y-2">
            <div class="text-sm font-medium">Wiederherstellungscodes</div>
            <ul class="text-sm grid grid-cols-2 gap-2">
              <li v-for="c in twofaRecoveryCodes" :key="c" class="font-mono p-2 border rounded">{{ c }}</li>
            </ul>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="text-sm">2FA ist aktiviert.</div>
          <div class="grid gap-2 max-w-xs">
            <FormField name="totpCode" v-slot="{ componentField }">
              <FormItem>
                <FormLabel>Wiederherstellungscodes neu erzeugen</FormLabel>
                <FormControl>
                  <Input v-model="twofaEnableCode" v-bind="componentField" placeholder="2FA-Code" inputmode="numeric" maxlength="6"/>
                  <div class="text-xs text-muted-foreground">Für das Regenerieren von Wiederherstellungscodes ist ein gültiger
                    Auth-Code erforderlich.
                  </div>
                  <Button variant="outline" :loading="twofaLoading" @click="regenerateRecoveryCodes">Bestätigen</Button>
                </FormControl>
              </FormItem>
            </FormField>

          </div>
          <div v-if="twofaRecoveryCodes" class="space-y-2">
            <div class="text-sm font-medium">Neue Wiederherstellungscodes</div>
            <ul class="text-sm grid grid-cols-2 gap-2">
              <li v-for="c in twofaRecoveryCodes" :key="c" class="font-mono p-2 border rounded">{{ c }}</li>
            </ul>
          </div>
          <div class="grid gap-2 max-w-xs">
            <FormField name="totpDeactivate" v-slot="{ componentField }">
              <FormItem>
                <FormLabel>2FA deaktivieren</FormLabel>
                <FormControl>
                  <Input v-model="twofaDisableCode" v-bind="componentField" placeholder="2FA-Code"/>
                  <Button variant="destructive" :loading="twofaLoading" @click="disableTwofa">Deaktivieren</Button>
                </FormControl>
              </FormItem>
            </FormField>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
