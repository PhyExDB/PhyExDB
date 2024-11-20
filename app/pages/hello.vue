<script lang="ts" setup>
const { data: hello } = await useAPI<string>("/hello")
</script>

<template>
  <div>
    <h1>Hello World</h1>
    <p>{{ hello }}</p>
  </div>
</template>
