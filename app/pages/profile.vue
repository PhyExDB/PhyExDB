<script setup lang="ts">
import UserDeleteAccountDialog from "~/components/user/UserDeleteAccountDialog.vue"
import getInitials from "~~/shared/utils/initials"

definePageMeta({
  title: "Profile",
  description: "Change your information",
})
const user = await useUserOrThrowError()

const { data: ownExperiments, refresh } = await useLazyFetch("/api/experiments/mine")
const { data: experimentsToReview } = await useFetch("/api/experiments/in-review?pageSize=0")

const emailVerifiedPopoverOpen = ref(false)
const loadingNewExperiment = ref(false)

const verifiedValue = user.value?.emailVerified
  ? "verifiziert"
  : "nicht verifiziert"

const canCreateExperiment = await allows(experimentAbilities.post)
const canReviewExperiments = await allows(experimentAbilities.review)

function nameOrPlaceholderForExperiment(experiment: ExperimentList) {
  return experiment.name || "Unbenannter Versuch"
}

function badgeTitleForExperimentStatus(status: string) {
  switch (status) {
    case "DRAFT":
      return "Entwurf"
    case "IN_REVIEW":
      return "In Überprüfung"
    case "PUBLISHED":
      return "Veröffentlicht"
    case "REJECTED":
      return "Abgelehnt"
  }
}

async function sendVerificationEmail() {
  await useAuth().client.sendVerificationEmail({
    email: user.value!.email,
    callbackURL: "/profile",
  })
  emailVerifiedPopoverOpen.value = false
}

async function deleteExperiment(id: string) {
  await $fetch(`/api/experiments/delete/${id}`, {
    method: "DELETE",
  })

  await refresh()
}

async function createExperiment() {
  loadingNewExperiment.value = true
  const experiment = await $fetch("/api/experiments", {
    method: "POST",
  })
  await navigateTo(`/experiments/edit/${experiment.id}`)
  loadingNewExperiment.value = false
}

function numberOfExperimentsToReview(): string {
  const numberOfExperimentsToReview = experimentsToReview?.value?.pagination.total ?? 0
  return numberOfExperimentsToReview === 1
    ? "1 Experiment"
    : `${numberOfExperimentsToReview} Experimente`
}

async function duplicateExperiment(experiment: ExperimentList, isRevision: boolean) {
  await $fetch(`/api/experiments/clone/${experiment.id}?revision=${isRevision}`, {
    method: "PUT",
  })
  await refresh()
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
        <template
          v-for="experiment in ownExperiments?.items ?? []"
          :key="experiment.id"
        >
          <Card
            v-if="!experiment.revisionOf"
            class="mt-4"
          >
            <CardContent class="p-4">
              <ExperimentRow
                :experiment="experiment"
                :name-or-placeholder-for-experiment="nameOrPlaceholderForExperiment"
                :badge-title-for-experiment-status="badgeTitleForExperimentStatus"
                :delete-experiment="deleteExperiment"
                :duplicate-experiment="duplicateExperiment"
              />
            </CardContent>
          </Card>
        </template>
        <Button
          v-if="canCreateExperiment"
          class="mt-4"
          :loading="loadingNewExperiment"
          @click="createExperiment"
        >
          Neuen Versuch erstellen
        </Button>
        <p
          v-else
          class="mt-4 text-muted-foreground"
        >
          Bitte verifiziere deine E-Mail-Adresse, um einen Versuch zu erstellen.
        </p>
      </CardContent>
    </Card>
  </div>
</template>
