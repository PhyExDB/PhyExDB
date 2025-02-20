
<script lang="ts" setup>

  const { stars } = defineProps<{ stars: number}>()

</script>

<template>
  <div>
    {{ stars }}
    <Icon
      name="heroicons:star"
      class="w-4 h-4"
    />
  </div>
</template>