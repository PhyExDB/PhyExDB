export function useNotifications() {
  const unreadCount = useState<number>("notification-unread-count", () => 0)

  const { data: countData, refresh: refreshCount } = useFetch("/api/notifications/unread-count", {
    server: false,
    watch: false,
  })

  watch(countData, (val) => {
    if (val) unreadCount.value = val.count
  }, { immediate: true })

  // Polling alle 30 Sekunden
  let interval: ReturnType<typeof setInterval> | null = null
  onMounted(() => {
    interval = setInterval(() => refreshCount(), 30_000)
  })
  onUnmounted(() => {
    if (interval) clearInterval(interval)
  })

  async function markAsRead(id: string) {
    await $fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      body: { isRead: true },
    })
    await refreshCount()
  }

  async function markAsUnread(id: string) {
    await $fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      body: { isRead: false },
    })
    await refreshCount()
  }

  async function markAllAsRead() {
    await $fetch("/api/notifications/mark-all-read", { method: "POST" })
    unreadCount.value = 0
  }

  async function deleteNotification(id: string) {
    await $fetch(`/api/notifications/${id}`, { method: "DELETE" })
    await refreshCount()
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
