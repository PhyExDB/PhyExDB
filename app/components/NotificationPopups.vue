<script lang="ts" setup>
const userRef = await useUser()
const user = userRef.value
const { data } = await useFetch("/api/notifications/check")
const showUserPopup = ref(false)
const showModeratorPopup = ref(false)

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

onMounted(() => {
  if (!data.value || !user) return

  if (hasNewRejected.value && data.value.needsRevisionCount > 0) {
    showUserPopup.value = true
  } else if (user.role !== "USER" && hasNewModeratorTasks.value) {
    showModeratorPopup.value = true
  }
})

function closeUserPopup() {
  showUserPopup.value = false
  if (data.value?.lastRejectedAt) {
    localStorage.setItem("last-rejected-seen", data.value.lastRejectedAt.toString())
  }

  if (user?.role !== "USER" && hasNewModeratorTasks.value) {
    showModeratorPopup.value = true
  }
}

function closeModeratorPopup() {
  showModeratorPopup.value = false
  if (data.value?.moderatorLastUpdate) {
    localStorage.setItem("last-mod-notif-seen", data.value.moderatorLastUpdate.toString())
  }
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
          as-child
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
            as-child
            class="flex-1"
            @click="closeModeratorPopup"
          >
            <NuxtLink href="/experiments/review">Prüfen</NuxtLink>
          </Button>
        </div>
      </template>
    </NotificationDialog>
  </div>
</template>
