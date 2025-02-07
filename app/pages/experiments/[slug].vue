<script lang="ts" setup>
const route = useRoute()
const experimentSlug = route.params.slug as string
</script>

<template>
  <ExperimentDetail
    :experiment-slug="experimentSlug"
  />
</template>
