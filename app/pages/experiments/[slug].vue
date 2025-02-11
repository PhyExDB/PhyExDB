<script lang="ts" setup>
const { data: experiment } = useFetch<ExperimentDetail>(`/api/experiments/${getSlug()}`)

if (!experiment) {
  throw showError({ statusCode: 404, statusMessage: "Experiment nicht gefunden" })
}
</script>

<template>
  <ExperimentDetail
    :experiment="experiment"
  />
</template>
