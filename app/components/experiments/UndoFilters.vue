<template>
  <Button
    @click="checked.forEach((values) => values.fill(false))"
  >
    Zurücksetzen <Icon
      name="heroicons:arrow-uturn-left"
      class="ml-2 h-4 w-4"
    />
  </Button>
</template>

<script lang="ts" setup>
const { checked } = defineProps<{
  checked: boolean[][]
}>()
</script>

<style>

</style>
