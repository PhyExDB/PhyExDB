<script lang="ts" setup>
const user = (await useUser()).value
const { notificationSummary } = useNotifications()

type ActivePopup = "user" | "moderator" | "unread" | null
const activePopup = ref<ActivePopup>(null)

function determineActivePopup() {
  if (!user) return

  const data = notificationSummary.value
  const lastRejectedSeen = Number(localStorage.getItem("last-rejected-seen") || 0)
  const lastModSeen = Number(localStorage.getItem("last-mod-notif-seen") || 0)
  const lastInboxSeen = Number(localStorage.getItem("last-inbox-seen") || 0)

  // 1. Priorität: Ablehnung
  if (
    data.lastRejectedAt
    && data.lastRejectedAt > lastRejectedSeen
    && data.needsRevisionCount > 0
  ) {
    activePopup.value = "user"
    return
  }

  // 2. Priorität: Moderator Aufgaben
  if (
    user.role !== "USER"
    && data.moderatorLastUpdate
    && data.moderatorLastUpdate > lastModSeen
    && data.moderatorNotifications > 0
  ) {
    activePopup.value = "moderator"
    return
  }

  // 3. Priorität: Postfach (Nur wenn neue Nachricht seit dem letzten Schließen)
  if (
    data.unreadCount > 0
    && data.lastNotificationAt
    && data.lastNotificationAt > lastInboxSeen
  ) {
    activePopup.value = "unread"
    return
  }

  activePopup.value = null
}

onMounted(() => {
  determineActivePopup()
})

watch(() => notificationSummary.value, () => {
  determineActivePopup()
}, { deep: true })

function closePopup() {
  const data = notificationSummary.value

  if (data.lastNotificationAt) {
    localStorage.setItem("last-inbox-seen", data.lastNotificationAt.toString())
  }

  if (activePopup.value === "user" && data.lastRejectedAt) {
    localStorage.setItem("last-rejected-seen", data.lastRejectedAt.toString())
  } else if (activePopup.value === "moderator" && data.moderatorLastUpdate) {
    localStorage.setItem("last-mod-notif-seen", data.moderatorLastUpdate.toString())
  }

  activePopup.value = null
  setTimeout(() => determineActivePopup(), 300)
}
</script>

<template>
  <div>
    <NotificationDialog
      :open="activePopup === 'user'"
      icon-name="heroicons:exclamation-triangle"
      title="Überarbeitung nötig"
      description="Einer deiner Versuche wurde beanstandet."
      @update:open="(val) => !val && closePopup()"
    >
      <NotificationItem
        title="Neue Beanstandung!"
        :description="`${notificationSummary.needsRevisionCount} ${notificationSummary.needsRevisionCount === 1 ? 'Versuch benötigt' : 'Versuche benötigen'} eine Korrektur.`"
        icon="heroicons:pencil-square"
        color-class="bg-red-500/10 text-red-600"
      />
      <template #footer>
        <Button
          class="w-full"
          @click="closePopup"
        >
          <NuxtLink href="/experiments/mine">Zu meinen Versuchen</NuxtLink>
        </Button>
      </template>
    </NotificationDialog>

    <NotificationDialog
      :open="activePopup === 'moderator'"
      icon-name="heroicons:clipboard-document-list"
      title="Warteschlange"
      description="Es gibt neue Versuche zur Überprüfung."
      @update:open="(val) => !val && closePopup()"
    >
      <NotificationItem
        title="Review ausstehend"
        :description="`${notificationSummary.moderatorNotifications} ${notificationSummary.moderatorNotifications === 1 ? 'Versuch wartet' : 'Versuche warten'} auf deine Prüfung.`"
        icon="heroicons:clipboard-document-list"
        color-class="bg-amber-500/10 text-amber-600"
      />
      <template #footer>
        <div class="flex gap-3">
          <Button
            variant="outline"
            class="flex-1"
            @click="closePopup"
          >
            Später
          </Button>
          <Button
            class="flex-1"
            @click="closePopup"
          >
            <NuxtLink href="/experiments/review">Prüfen</NuxtLink>
          </Button>
        </div>
      </template>
    </NotificationDialog>

    <NotificationDialog
      :open="activePopup === 'unread'"
      icon-name="heroicons:bell"
      title="Neue Benachrichtigungen"
      description="Du hast neue Nachrichten in deinem Postfach."
      @update:open="(val) => !val && closePopup()"
    >
      <NotificationItem
        title="Postfach"
        :description="`Du hast ${notificationSummary.unreadCount} neue ${notificationSummary.unreadCount === 1 ? 'Nachricht' : 'Nachrichten'}.`"
        icon="heroicons:envelope"
        color-class="bg-blue-500/10 text-blue-600"
      />
      <template #footer>
        <Button
          class="w-full"
          @click="closePopup"
        >
          <NuxtLink href="/inbox">Zum Postfach</NuxtLink>
        </Button>
      </template>
    </NotificationDialog>
  </div>
</template>
