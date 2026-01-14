<script lang="ts" setup>
import FavoriteButton from "~/components/experiment/FavoriteButton.vue";

const props = defineProps<{
  experiment: Pick<ExperimentList, "id" | "ratingsSum" | "ratingsCount"> & {isFavorited: boolean}
  small?: boolean
}>()
const ratingsSum = computed(() => props.experiment.ratingsSum)
const ratingsCount = computed(() => props.experiment.ratingsCount)
const ratingsAvg = computed(() => (ratingsSum.value / ratingsCount.value).toFixed(1))

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
    <ExperimentFavoriteButton
        :experiment-id="experiment.id"
        :is-favorited-initial="experiment.isFavorited ?? false"
    />
  </div>
</template>