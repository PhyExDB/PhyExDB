<script lang="ts" setup>
const props = defineProps<{ experiment: Pick<ExperimentList, "ratingsSum" | "ratingsCount"> }>()
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
  <div class="flex flex-col sm:flex-row items-center space-x-2 text-muted-foreground">
    <ExperimentRatingStars
      :selected="ratingsSum / ratingsCount"
    />
    <p class="py-1 flex justify-center">
      {{ ratingsCount === 0 ? "" : ratingsAvg }}
      ({{ ratingsString() }})
    </p>
  </div>
</template>
