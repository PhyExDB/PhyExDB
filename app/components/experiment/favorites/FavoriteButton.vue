<script setup lang="ts">
import { toast } from "~/components/ui/toast"

const props = defineProps<{
  experimentId: string
  isFavoritedInitial: boolean
}>()

const { toggleFavorite, favoriteState, syncFavoriteState } = useFavorite()

syncFavoriteState(props.experimentId, props.isFavoritedInitial)

const isFavorited = computed(() => favoriteState.value[props.experimentId] ?? props.isFavoritedInitial)
const isLoading = ref(false)
const canRate = await allows(experimentAbilities.rate)

async function handleToggle() {
  if (!canRate.value) {
    toast({
      title: "Anmeldung erforderlich",
      description: "Bitte logge dich ein, um Favoriten zu speichern.",
      variant: "destructive",
    })
    return navigateTo("/login")
  }

  if (isLoading.value) return
  isLoading.value = true

  try {
    await toggleFavorite(props.experimentId)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    :disabled="isLoading"
    @click.stop.prevent="handleToggle"
  >
    <Icon
      :name="isFavorited ? 'heroicons:heart-solid' : 'heroicons:heart'"
      :class="[isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-400']"
      class="h-5 w-5 transition-colors"
    />
  </Button>
</template>
