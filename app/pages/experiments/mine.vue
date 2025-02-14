<script lang="ts" setup>
await useUserOrThrowError()

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
      <div class="flex flex-col items-center space-y-4 text-gray-400">
        <h1 class="text-2xl">
          Du hast noch keine Versuche erstellt
        </h1>
        <Button>
          <NuxtLink to="/profile">Zurück zum Profil</NuxtLink>
        </Button>
      </div>
    </div>
  </div>
</template>
