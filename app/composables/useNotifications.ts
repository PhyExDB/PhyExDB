import { useToast } from "~/components/ui/toast"

export function useNotifications() {
  const unreadCount = useState<number>("notification-unread-count", () => 0)
  const { toast } = useToast()

  const { data: countData, refresh: refreshCount } = useFetch("/api/notifications/unread-count", {
    server: false,
    watch: false,
  })

  watch(countData, (val) => {
    if (val) unreadCount.value = val.count
  }, { immediate: true })

  // Polling alle 30 Sekunden
  let interval: ReturnType<typeof setInterval> | null = null

  if (import.meta.client) {
    onMounted(() => {
      interval = setInterval(() => refreshCount(), 30_000)
    })
    onUnmounted(() => {
      if (interval) clearInterval(interval)
    })
  }

  async function markAsRead(id: string) {
    try {
      await $fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        body: { isRead: true },
      })
    } catch (e) {
      toast({
        title: "Fehler",
        description: "Benachrichtigung konnte nicht als gelesen markiert werden.",
        variant: "destructive",
      })
      throw e
    }
  }

  async function markAsUnread(id: string) {
    try {
      await $fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        body: { isRead: false },
      })
    } catch (e) {
      toast({
        title: "Fehler",
        description: "Benachrichtigung konnte nicht als ungelesen markiert werden.",
        variant: "destructive",
      })
      throw e
    }
  }

  async function markAllAsRead() {
    try {
      await $fetch("/api/notifications/mark-all-read", { method: "POST" })
      unreadCount.value = 0
    } catch (e) {
      toast({
        title: "Fehler",
        description: "Benachrichtigungen konnten nicht als gelesen markiert werden.",
        variant: "destructive",
      })
      throw e
    }
  }

  async function deleteNotification(id: string) {
    try {
      await $fetch(`/api/notifications/${id}`, { method: "DELETE" })
    } catch (e) {
      toast({
        title: "Fehler",
        description: "Benachrichtigung konnte nicht gelöscht werden.",
        variant: "destructive",
      })
      throw e
    }
  }

  return {
    unreadCount,
    refreshCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
  }
}
