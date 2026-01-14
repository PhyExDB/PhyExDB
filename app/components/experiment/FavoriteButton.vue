<script setup lang="ts">
const props = defineProps<{
  experimentId: string
  isFavoritedInitial: boolean
}>()

const { toggleFavorite } = useFavorite()
const isFavorited = ref(props.isFavoritedInitial)
const isLoading = ref(false)

async function handleToggle() {
  if (isLoading.value) return
  isLoading.value = true

  const result = await toggleFavorite(props.experimentId)
  if (result !== null) {
    isFavorited.value = result
  }
  isLoading.value = false
}
</script>

<template>
  <Button
      variant="ghost"
      size="icon"
      @click.stop.prevent="handleToggle"
      :disabled="isLoading"
  >
    <LucideHeart
        :class="[isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-500']"
        class="h-5 w-5 transition-colors"
    />
  </Button>
</template>