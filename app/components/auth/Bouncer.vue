<script lang="ts" setup generic="T extends any[]">
const props = defineProps<{
  ability: Ability<T>
  param: T
}>()
const can = await allows(props.ability, ...props.param)
</script>

<template>
  <slot
    v-if="can"
    name="can"
  />
  <slot
    v-else
    name="cannot"
  />
</template>
