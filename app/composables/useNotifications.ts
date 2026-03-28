import { useToast } from "~/components/ui/toast"

export function useNotifications() {
  const { toast } = useToast()

  const notificationSummary = useState("notification-summary-state", () => ({
    unreadCount: 0,
    moderatorNotifications: 0,
    needsRevisionCount: 0,
    lastRejectedAt: undefined as number | undefined,
    moderatorLastUpdate: undefined as number | undefined,
    lastNotificationAt: undefined as number | undefined,
  }))

  const { data: summaryData, refresh: refreshSummary } = useFetch("/api/notifications/summary", {
    server: false,
    watch: false,
  })

  watch(summaryData, (val) => {
    if (val) {
      notificationSummary.value = {
        unreadCount: val.unreadCount ?? 0,
        moderatorNotifications: val.moderatorNotifications ?? 0,
        needsRevisionCount: val.needsRevisionCount ?? 0,
        lastRejectedAt: val.lastRejectedAt ?? undefined,
        moderatorLastUpdate: val.moderatorLastUpdate ?? undefined,
        lastNotificationAt: val.lastNotificationAt ?? undefined,
      }
    }
  }, { immediate: true })

  // Polling alle 30 Sekunden
  let interval: ReturnType<typeof setInterval> | null = null

  if (import.meta.client) {
    onMounted(() => {
      interval = setInterval(() => refreshSummary(), 30_000)
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
      await refreshSummary()
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
      await refreshSummary()
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
      await refreshSummary()
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
      await refreshSummary()
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
    notificationSummary,
    refreshSummary,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
  }
}
