<script setup lang="ts">
import getInitials from "~~/shared/utils/initials"

definePageMeta({
  title: "Profile",
  description: "Change your information",
})
const user = await useUserOrThrowError()

const { data: ownExperiments } = await useFetch("/api/experiments/mine")

const emailVerifiedPopoverOpen = ref(false)
const loadingNewExperiment = ref(false)

const verifiedValue = user.value?.emailVerified
  ? "verifiziert"
  : "nicht verifiziert"

const canCreateExperiment = await allows(experimentAbilities.post)

function nameOrPlaceholderForExperiment(experiment: ExperimentList) {
  return experiment.name || "Unbenanntes Experiment"
}

function badgeTitleForExperimentStatus(status: string) {
  switch (status) {
    case "DRAFT":
      return "Entwurf"
    case "IN_REVIEW":
      return "In Überprüfung"
    case "PUBLISHED":
      return "Veröffentlicht"
  }
}

async function sendVerificationEmail() {
  await useAuth().client.sendVerificationEmail({
    email: user.value!.email,
    callbackURL: "/profile",
  })
  emailVerifiedPopoverOpen.value = false
}

async function createExperiment() {
  loadingNewExperiment.value = true
  const experiment = await $fetch("/api/experiments", {
    method: "POST",
  })
  await navigateTo(`/experiments/edit/${experiment.id}`)
  loadingNewExperiment.value = false
}
</script>

<template>
  <div v-if="user">
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
          </div>
        </div>
      </CardContent>
    </Card>
    <Card class="mt-4">
      <CardContent class="p-6">
        <div class="text-xl">
          Meine Experimente
        </div>
        <template
          v-for="experiment in ownExperiments?.items ?? []"
          :key="experiment.id"
        >
          <NuxtLink
            :to="experiment.status === 'DRAFT' ? `/experiments/edit/${experiment.id}` : `/experiments/${experiment.slug}`"
            class="no-underline"
          >
            <Card class="mt-4">
              <CardContent class="p-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <p class="font-medium">
                      {{ nameOrPlaceholderForExperiment(experiment) }}
                    </p>
                    <Badge variant="secondary">
                      {{ badgeTitleForExperimentStatus(experiment.status) }}
                    </Badge>
                  </div>
                  <Button
                    v-if="experiment.status === 'DRAFT'"
                    variant="outline"
                  >
                    Bearbeiten
                  </Button>
                </div>
              </CardContent>
            </Card>
          </NuxtLink>
        </template>
        <Button
          v-if="canCreateExperiment"
          class="mt-4"
          :loading="loadingNewExperiment"
          @click="createExperiment"
        >
          Neues Experiment erstellen
        </Button>
        <p
          v-else
          class="mt-4 text-muted-foreground"
        >
          Bitte verifiziere deine E-Mail-Adresse, um ein Experiment zu erstellen.
        </p>
      </CardContent>
    </Card>
  </div>
</template>
