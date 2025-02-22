<script setup lang="ts">
const { selected, editable } = defineProps({
  selected: {
    type: Number,
    required: true,
  },
  editable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  (e: "update:selected", updated: number): void
}>()

const max = 5
const hover = ref(selected)

watch(() => selected, () => {
  hover.value = selected
})

function getState(i: number) {
  if (i <= hover.value && i <= selected) {
    return "selected"
  } else if (i <= hover.value || i <= selected) {
    return "hover"
  } else {
    return "unselected"
  }
}

function setHover(i: number) {
  if (editable) {
    hover.value = i
  }
}

function setValue(i: number) {
  if (editable) {
    emit("update:selected", i)
  }
}
</script>

<template>
  <div>
    <template
      v-for="i in max"
      :key="i"
    >
      <ExperimentRatingStar
        :state="getState(i)"
        @click="setValue(i)"
        @hover="setHover(i)"
        @end-hover="hover = selected"
      />
    </template>
  </div>
</template>
