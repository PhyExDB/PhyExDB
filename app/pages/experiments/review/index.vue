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
</script>

<template>
  <div>
    <h2 class="text-4xl font-extrabold">
      Zu überprüfende Experimente
    </h2>
    <div v-if="experimentsToReview">
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
  </div>
</template>
