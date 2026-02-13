import { useToast } from "~/components/ui/toast"

export const useFavorite = () => {
  const { toast } = useToast()

  const favoriteState = useState<Record<string, boolean>>("global-favorites-map", () => ({}))

  const toggleFavorite = async (experimentId: string) => {
    try {
      const { favorited } = await $fetch<{ favorited: boolean }>(`/api/experiments/favorites/${experimentId}`, {
        method: "POST",
      })

      favoriteState.value[experimentId] = favorited
      return favorited
    } catch (error) {
      const message = error instanceof Error ? error.message : "Aktion fehlgeschlagen"
      toast({
        title: "Fehler",
        description: message,
        variant: "destructive",
      })
      return null
    }
  }

  const syncFavoriteState = (experimentId: string, isFavorited: boolean) => {
    if (favoriteState.value[experimentId] === undefined) {
      favoriteState.value[experimentId] = isFavorited
    }
  }

  return {
    toggleFavorite,
    favoriteState,
    syncFavoriteState,
  }
}
