<script lang="ts" setup>
const props = defineProps<{
  experiment: Pick<ExperimentList, "id">
}>()
const id = computed(() => props.experiment.id)

const canRate = await allows(experimentAbilities.rate)

const { data: ownRating } = await useFetch<ExperimentRating>(`/api/experiments/ratings/${id.value}`)

async function deleteRating() {
  await $fetch(`/api/experiments/ratings/${id.value}`, {
    method: "DELETE",
  })
  ownRating.value = undefined
}

async function submitRating(newRating: number) {
  await $fetch(`/api/experiments/ratings/${id.value}`, {
    method: ownRating.value ? "PUT" : "POST",
    body: {
      value: newRating,
    },
  })
  ownRating.value = { value: newRating }
}
</script>

<template>
  <div
    v-if="canRate"
    class="flex flex-col sm:flex-row items-center space-x-3 space-y-2 sm:space-y-0"
  >
    <div>
      <h1 class="text-4xl font-extrabold mr-2 pb-4">
        Versuch Bewerten
      </h1>

      <ExperimentRatingStars
        :selected="ownRating?.value ?? 0"
        :editable="true"
        @update:selected="submitRating"
      />
      <Button
        variant="outline"
        @click="deleteRating"
      >
        Eigene Bewertung löschen
      </Button>
    </div>
  </div>
</template>
