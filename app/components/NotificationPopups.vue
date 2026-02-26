<script lang="ts" setup>
const user = (await useUser()).value
const { data } = await useFetch("/api/notifications/check")

type ActivePopup = "user" | "moderator" | "unread" | null
const activePopup = ref<ActivePopup>(null)

function determineActivePopup() {
  if (!data.value || !user) return

  const lastRejectedSeen = Number(localStorage.getItem("last-rejected-seen") || 0)
  const lastModSeen = Number(localStorage.getItem("last-mod-notif-seen") || 0)
  const lastInboxSeen = Number(localStorage.getItem("last-inbox-seen") || 0)

  // 1. Priorität: Ablehnung
  if (
    data.value.lastRejectedAt
    && data.value.lastRejectedAt > lastRejectedSeen
    && data.value.needsRevisionCount > 0
  ) {
    activePopup.value = "user"
    return
  }

  // 2. Priorität: Moderator Aufgaben
  if (
    user.role !== "USER"
    && data.value.moderatorLastUpdate
    && data.value.moderatorLastUpdate > lastModSeen
    && data.value.moderatorNotifications > 0
  ) {
    activePopup.value = "moderator"
    return
  }

  // 3. Priorität: Postfach (Nur wenn neue Nachricht seit dem letzten Schließen)
  if (
    data.value.unreadCount > 0
    && data.value.lastNotificationAt
    && data.value.lastNotificationAt > lastInboxSeen
  ) {
    activePopup.value = "unread"
    return
  }

  activePopup.value = null
}

onMounted(() => {
  determineActivePopup()
})

function closePopup() {
  if (!data.value) return

  if (activePopup.value === "user") {
    if (data.value.lastRejectedAt) {
      localStorage.setItem("last-rejected-seen", data.value.lastRejectedAt.toString())
    }
    if (data.value.lastNotificationAt) {
      localStorage.setItem("last-inbox-seen", data.value.lastNotificationAt.toString())
    }
  } else if (activePopup.value === "moderator") {
    if (data.value.moderatorLastUpdate) {
      localStorage.setItem("last-mod-notif-seen", data.value.moderatorLastUpdate.toString())
    }
    if (data.value.lastNotificationAt) {
      localStorage.setItem("last-inbox-seen", data.value.lastNotificationAt.toString())
    }
  } else if (activePopup.value === "unread") {
    if (data.value.lastNotificationAt) {
      localStorage.setItem("last-inbox-seen", data.value.lastNotificationAt.toString())
    }
  }

  activePopup.value = null

  setTimeout(() => {
    determineActivePopup()
  }, 300)
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
        :description="`${data?.needsRevisionCount} ${data?.needsRevisionCount === 1 ? 'Versuch benötigt' : 'Versuche benötigen'} eine Korrektur.`"
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
      <div class="rounded-xl bg-muted/50 p-6 text-center border">
        <span class="text-6xl font-light tracking-tighter text-foreground">
          {{ data?.moderatorNotifications }}
        </span>
        <p class="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Offene Reviews
        </p>
      </div>
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
      title="Benachrichtigungen"
      description="Du hast neue Nachrichten in deinem Postfach."
      @update:open="(val) => !val && closePopup()"
    >
      <NotificationItem
        :title="`${data?.unreadCount} neue Nachricht(en)`"
        description="Schau in dein Postfach, um die Details zu sehen."
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
