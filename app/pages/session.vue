<template>
  <div>
    {{ session }}
  </div>
</template>

<script lang="ts" setup>
const session = await authClient.useSession(useFetch)
</script>

<style>

</style>
