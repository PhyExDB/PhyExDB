<script lang="ts" setup>
const props = defineProps<{
  experiment: Pick<ExperimentList, "id" | "ratingsSum" | "ratingsCount"> & {isFavorited?: boolean}
  small?: boolean
}>()
const ratingsSum = computed(() => props.experiment.ratingsSum)
const ratingsCount = computed(() => props.experiment.ratingsCount)
const ratingsAvg = computed(() => (ratingsSum.value / ratingsCount.value).toFixed(1))

const { toggleFavorite } = useFavorite()
const isFavorited = ref(props.experiment.isFavorited || false)

async function handleFavoriteClick() {
  const result = await toggleFavorite(props.experiment.id)
  if (result !== null) {
    isFavorited.value = result
  }
}

function ratingsString() {
  if (ratingsCount.value === 0) {
    return "Keine Bewertungen"
  } else if (ratingsCount.value === 1) {
    return "1 Bewertung"
  } else {
    return `${ratingsCount.value} Bewertungen`
  }
}
</script>

<template>
  <div
    v-if="!small"
    class="flex flex-col sm:flex-row items-center space-x-2 text-muted-foreground"
  >
    <ExperimentRatingStars
      :selected="ratingsSum / ratingsCount"
    />
    <p class="py-1 flex justify-center">
      {{ ratingsCount === 0 ? "" : ratingsAvg }}
      ({{ ratingsString() }})
    </p>

    <UiButton
        variant="ghost"
        size="icon"
        class="ml-2"
        title="Favorit umschalten"
        @click.stop.prevent="handleFavoriteClick"
    >
      <Icon
          :name="isFavorited ? 'heroicons:heart-solid' : 'heroicons:heart'"
          :class="isFavorited ? 'text-red-500' : 'text-muted-foreground'"
          class="w-6 h-6 transition-colors"
      />
    </UiButton>
  </div>
  <div
    v-else
    class="flex flex-row space-x-1 text-muted-foreground items-center"
  >
    <template
      v-if="ratingsCount !== 0"
    >
      <Icon
        name="heroicons:star"
        class="w-4 h-4"
      />
      <p>
        {{ ratingsAvg }}
      </p>
    </template>
    <p>
      ({{ ratingsString() }})
    </p>

    <UiButton
        variant="ghost"
        size="icon"
        class="h-8 w-8"
        @click.stop.prevent="handleFavoriteClick"
    >
      <Icon
          :name="isFavorited ? 'heroicons:heart-solid' : 'heroicons:heart'"
          :class="isFavorited ? 'text-red-500' : 'text-muted-foreground'"
          class="w-4 h-4"
      />
    </UiButton>

  </div>
</template>
