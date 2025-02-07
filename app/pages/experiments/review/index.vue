<script lang="ts" setup>
const user = await useUser()

if (!user.value || user.value.role == "USER") {
  await navigateTo("/")
}

const { data: experimentsToReview } = await useFetch("/api/experiments/in-review")

</script>

<template>
  <div>
    {{ experimentsToReview }}
  </div>
</template>
