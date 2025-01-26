<template>
  <Button
    @click="checked.forEach((values) => values.fill(false))"
  >
    Zurücksetzen <ResetIcon class="ml-2 h-4 w-4" />
  </Button>
</template>

<script lang="ts" setup>
import { ResetIcon } from "@radix-icons/vue"

const props = defineProps<{
  checked: boolean[][]
}>()
</script>

<style>

</style>
