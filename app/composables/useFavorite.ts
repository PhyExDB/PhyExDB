import { useToast } from "~/components/ui/toast"

export const useFavorite = () => {
  const { toast } = useToast()

  const toggleFavorite = async (experimentId: string) => {
    try {
      const { favorited } = await $fetch<{ favorited: boolean }>(`/api/experiments/favorites/${experimentId}`, {
        method: "POST",
      })
      return favorited
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.statusMessage || "Aktion fehlgeschlagen",
        variant: "destructive",
      })
      return null
    }
  }

  return { toggleFavorite }
}
