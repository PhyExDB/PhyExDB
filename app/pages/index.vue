<script setup lang="ts">
const selected = ref(3)
</script>

<template>
  <div>
    <ExperimentRatingStars
      :selected="selected"
      :editable="true"
      @update:selected="selected = $event"
    />
  </div>
</template>
