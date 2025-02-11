<script lang="ts" setup>
const route = useRoute()
const experimentSlug = route.params.slug as string
const { data: experiment } = useFetch<ExperimentDetail>(`/api/experiments/${experimentSlug}`)

if (!experiment) {
  throw showError({ statusCode: 404, statusMessage: "Experiment nicht gefunden" })
}
</script>

<template>
  <ExperimentDetail
    :experiment="experiment"
  />
</template>
