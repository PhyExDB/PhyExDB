<script lang="ts" setup>
const user = await useUser()

if (!user.value || user.value.role == "USER") {
  await navigateTo("/")
}

const { page, pageSize } = getRequestPageMeta()

const { data: experimentsToReview } = await useLazyFetch("/api/experiments/in-review", {
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
</script>

<template>
  <div>
    <!-- Experiments to show -->
    <div v-if="experimentsToReview && experimentsToReview.pagination.total > 0">
      <h2 class="text-4xl font-extrabold">
        Zu überprüfende Experimente
      </h2>
      <template
        v-for="experiment in experimentsToReview.items"
        :key="experiment.id"
      >
        <NuxtLink
          :to="`/experiments/review/${experiment.slug}`"
          class="no-underline"
        >
          <Card class="mt-4">
            <CardContent class="p-4">
              <div class="flex items-center flex-col sm:flex-row justify-between">
                <div class="flex items-center space-x-2">
                  <p class="font-medium">
                    {{ experiment.name }}
                  </p>
                </div>
                <div class="flex items-center space-x-2 pt-2 sm:pt-0">
                  <Button
                    variant="outline"
                  >
                    Überprüfen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </NuxtLink>
      </template>
    </div>
    <MyPagination
      v-model="page"
      :page-meta="experimentsToReview?.pagination"
    />

    <!-- No experiments to show -->
    <div
      v-if="!experimentsToReview || experimentsToReview.pagination.total === 0"
      class="flex items-center justify-center min-h-screen"
    >
      <div class="flex flex-col items-center space-y-4 text-gray-400">
        <h1 class="text-2xl">
          Es gibt keine Experimente mehr zu überprüfen
        </h1>
        <Button>
          <NuxtLink to="/profile">Zurück zum Profil</NuxtLink>
        </Button>
      </div>
    </div>
  </div>
</template>
