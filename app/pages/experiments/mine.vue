<script lang="ts" setup>
import { useToast } from "@/components/ui/toast/use-toast"

await useUserOrThrowError()

const user = await useUserOrThrowError()

const { page, pageSize } = getRequestPageMeta()

const { data: ownExperiments, refresh } = await useLazyFetch("/api/experiments/mine", {
  query: {
    page: page,
    pageSize: pageSize,
  },
})

// Update the URL
const route = useRoute()
const router = useRouter()
watch([page, pageSize], () => {
  const query: {
    page?: number
    pageSize?: number
  } = {}
  if (page.value !== defaultPage) {
    query.page = page.value
  }
  if (pageSize.value !== defaultPageSize) {
    query.pageSize = pageSize.value
  }
  const newUrl = { path: route.path, query }
  router.replace(newUrl)
})

async function customRefresh() {
  await refresh()
  if (ownExperiments.value?.items.length === 0 && ownExperiments.value?.pagination.total > 0) {
    page.value = Math.max(page.value - 1, 1)
    await refresh()
  }
}

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
}

const canCreateExperiment = await allows(experimentAbilities.post)
</script>

<template>
  <div>
    <!-- Experiments to show -->
    <div v-if="ownExperiments && ownExperiments.pagination.total > 0">
      <h2 class="text-4xl font-extrabold">
        Meine Versuche
      </h2>
      <ExperimentOwnList
        :own-experiments="ownExperiments"
        :delete-experiment="(id: string) => deleteExperiment(id).then(() => customRefresh())"
      />
    </div>
    <MyPagination
      v-model="page"
      :page-meta="ownExperiments?.pagination"
    />

    <!-- No experiments to show -->
    <div
      v-if="!ownExperiments || ownExperiments.pagination.total === 0"
      class="flex items-center justify-center min-h-screen"
    >
      <div class="flex flex-col items-center space-y-4 text-center">
        <h1 class="text-2xl">
          Du hast noch keine Versuche erstellt
        </h1>
        <Button
          v-if="canCreateExperiment"
          @click="createExperiment"
        >
          Neuen Versuch erstellen
        </Button>
        <div
          v-else
          class="flex flex-col items-center space-y-4"
        >
          <p class="text-muted-foreground">
            Bitte verifiziere deine E-Mail-Adresse, um einen Versuch zu erstellen.
          </p>
          <Button
            v-if="!user.emailVerified"
            variant="outline"
            class="mt-3"
            @click="sendVerificationEmail"
          >
            E-Mail verifizieren
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
