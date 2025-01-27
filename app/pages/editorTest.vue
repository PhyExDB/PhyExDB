<script lang="ts" setup>
const text = ref({
  text: "Hello World!",
})
</script>

<template>
  <div>
    <TipTapEditor v-model="text.text" />
    <Button @click="console.log(text)">
      Log Text
    </Button>
  </div>
</template>
