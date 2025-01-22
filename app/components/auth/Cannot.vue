<script lang="ts" setup generic="T extends any[]">
const props = defineProps<{
  ability: Ability<T>
  param: T
}>()
const cannot = await denies(props.ability, ...props.param)
</script>

<template>
  <div v-if="cannot">
    <slot />
  </div>
</template>
