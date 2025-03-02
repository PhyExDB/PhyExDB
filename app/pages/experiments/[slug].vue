<script lang="ts" setup>
const { data: experiment } = useFetch<ExperimentDetail>(`/api/experiments/${getSlug()}`)

if (!experiment) {
  throw showError({ statusCode: 404, statusMessage: "Versuch nicht gefunden" })
}

useSchemaOrg([
  defineArticle({
    title: experiment.value?.name,
    description: experiment.value?.sections?.[0]?.text,
  }),
])
</script>

<template>
  <ExperimentDetail
    :experiment="experiment"
  />
</template>
