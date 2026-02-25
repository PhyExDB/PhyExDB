<script lang="ts" setup>
const userRef = await useUser()
const user = userRef.value
const { data } = await useFetch("/api/notifications/check")
const showUserPopup = ref(false)
const showModeratorPopup = ref(false)
const showUnreadPopup = ref(false)

const hasNewRejected = computed(() => {
  if (!data.value?.lastRejectedAt) return false
  const lastSeen = Number(localStorage.getItem("last-rejected-seen") || 0)
  return data.value.lastRejectedAt > lastSeen
})

const hasNewModeratorTasks = computed(() => {
  if (!data.value?.moderatorLastUpdate) return false
  const lastSeen = Number(localStorage.getItem("last-mod-notif-seen") || 0)
  return data.value.moderatorLastUpdate > lastSeen
})

const hasUnreadNotifications = computed(() => {
  return (data.value?.unreadCount || 0) > 0
})

onMounted(() => {
  if (!data.value || !user) return

  // Priorität 1: Ablehnungen
  // Priorität 2: Moderator Aufgaben
  // Priorität 3: Allgemeine ungelesene Nachrichten
  if (hasNewRejected.value && data.value.needsRevisionCount > 0) {
    showUserPopup.value = true
  } else if (user.role !== "USER" && hasNewModeratorTasks.value) {
    showModeratorPopup.value = true
  } else if (hasUnreadNotifications.value) {
    showUnreadPopup.value = true
  }
})

function closeUserPopup() {
  showUserPopup.value = false
  if (data.value?.lastRejectedAt) {
    localStorage.setItem("last-rejected-seen", data.value.lastRejectedAt.toString())
  }
  if (user?.role !== "USER" && hasNewModeratorTasks.value) {
    showModeratorPopup.value = true
  } else if (hasUnreadNotifications.value) {
    showUnreadPopup.value = true
  }
}

function closeModeratorPopup() {
  showModeratorPopup.value = false
  if (data.value?.moderatorLastUpdate) {
    localStorage.setItem("last-mod-notif-seen", data.value.moderatorLastUpdate.toString())
  }
  if (hasUnreadNotifications.value) {
    showUnreadPopup.value = true
  }
}

function closeUnreadPopup() {
  showUnreadPopup.value = false
}
</script>

<template>
  <div>
    <NotificationDialog
      :open="showUserPopup"
      icon-name="heroicons:exclamation-triangle"
      title="Überarbeitung nötig"
      description="Einer deiner Versuche wurde beanstandet."
      @update:open="(val) => !val && closeUserPopup()"
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
          @click="closeUserPopup"
        >
          <NuxtLink href="/experiments/mine">Zu meinen Versuchen</NuxtLink>
        </Button>
      </template>
    </NotificationDialog>

    <NotificationDialog
      :open="showModeratorPopup"
      icon-name="heroicons:clipboard-document-list"
      title="Warteschlange"
      description="Es gibt neue Versuche zur Überprüfung."
      @update:open="(val) => !val && closeModeratorPopup()"
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
            @click="closeModeratorPopup"
          >
            Später
          </Button>
          <Button
            class="flex-1"
            @click="closeModeratorPopup"
          >
            <NuxtLink href="/experiments/review">Prüfen</NuxtLink>
          </Button>
        </div>
      </template>
    </NotificationDialog>

    <NotificationDialog
      :open="showUnreadPopup"
      icon-name="heroicons:bell"
      title="Benachrichtigungen"
      description="Du hast neue Nachrichten in deinem Postfach."
      @update:open="(val) => !val && closeUnreadPopup()"
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
          @click="closeUnreadPopup"
        >
          <NuxtLink href="/notifications">Zum Postfach</NuxtLink>
        </Button>
      </template>
    </NotificationDialog>
  </div>
</template>
