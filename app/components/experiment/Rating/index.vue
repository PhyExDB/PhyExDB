<script lang="ts" setup>
const props = defineProps<{ experiment: Pick<ExperimentList, "ratingsSum" | "ratingsCount"> }>()
const ratingsSum = computed(() => props.experiment.ratingsSum)
const ratingsCount = computed(() => props.experiment.ratingsCount)

</script>

<template>
  <ExperimentRatingStars
    v-if="ratingsCount"
    :stars="ratingsSum / ratingsCount"
  />
  von {{ ratingsCount }} {{ ratingsCount==1 ? "Bewertung" : "Bewertungen" }}
</template>