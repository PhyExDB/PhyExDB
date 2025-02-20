
<script lang="ts" setup>

  const { stars } = defineProps<{ stars: number}>()

</script>

<template>
  <div>
    {{ stars }}
    <Icon
      name="heroicons:star-solid"
      class="w-4 h-4"
    />

    <div>
    
    </div>
  </div>
</template>