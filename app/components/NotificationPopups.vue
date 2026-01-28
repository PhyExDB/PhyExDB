<script lang="ts" setup>
const userRef = await useUser()
const user = userRef.value
const { data } = await useFetch("/api/notifications/check")
const showUserPopup = ref(false)
const showModeratorPopup = ref(false)
const publishedCount = computed(() => data.value?.publishedCount ?? 0)
const needsRevisionCount = computed(() => data.value?.needsRevisionCount ?? 0)
const moderatorNotifications = computed(() => data.value?.moderatorNotifications ?? 0)

const hasNewPublished = computed(() => {
  if (!data.value?.lastPublishedAt) return false
  const lastSeen = Number(localStorage.getItem("last-published-seen") || 0)
  return data.value.lastPublishedAt > lastSeen
})

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

  if (hasNewPublished.value || hasNewRejected.value) {
    showUserPopup.value = true
  } else {
    checkModeratorPopup()
  }
})

function checkModeratorPopup() {
  if (!user || user.role === "USER") return

  if (hasNewModeratorTasks.value) {
    showModeratorPopup.value = true
  }
}

function closeUserPopup() {
  showUserPopup.value = false

  if (data.value?.lastPublishedAt) {
    localStorage.setItem("last-published-seen", data.value.lastPublishedAt.toString())
  }
  if (data.value?.lastRejectedAt) {
    localStorage.setItem("last-rejected-seen", data.value.lastRejectedAt.toString())
  }

  checkModeratorPopup()
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
      icon-name="heroicons:bell-alert"
      title="Neuigkeiten zu deinen Versuchen"
      description="Es hat sich etwas geändert seit deinem letzten Besuch."
      @update:open="(val) => !val && closeUserPopup()"
    >
      <div class="space-y-3">
        <NotificationItem
          v-if="hasNewPublished && publishedCount > 0"
          title="Neu veröffentlicht!"
          :description="`${publishedCount} ${publishedCount === 1 ? 'Versuch ist' : 'Versuche sind'} jetzt live.`"
          icon="heroicons:check-badge"
          color-class="bg-emerald-500/10 text-emerald-600"
        />
        <NotificationItem
          v-else-if="publishedCount > 0"
          title="Status: Live"
          :description="`${publishedCount} ${publishedCount === 1 ? 'Versuch ist' : 'Versuche sind'} aktuell veröffentlicht.`"
          icon="heroicons:check-badge"
          color-class="bg-emerald-500/10 text-emerald-600"
        />
        <NotificationItem
          v-if="hasNewRejected && needsRevisionCount > 0"
          title="Neue Beanstandung!"
          :description="`${needsRevisionCount} ${needsRevisionCount === 1 ? 'Versuch benötigt' : 'Versuche benötigen'} Überarbeitung.`"
          icon="heroicons:exclamation-triangle"
          color-class="bg-red-500/10 text-red-600"
        />
        <NotificationItem
          v-else-if="needsRevisionCount > 0"
          title="Überarbeitung nötig"
          :description="`${needsRevisionCount} ${needsRevisionCount === 1 ? 'Versuch benötigt' : 'Versuche benötigen'} eine Überarbeitung.`"
          icon="heroicons:pencil-square"
          color-class="bg-amber-500/10 text-amber-600"
        />
      </div>

      <template #footer>
        <Button
          as-child
          class="w-full py-6 shadow-md"
          @click="closeUserPopup"
        >
          <NuxtLink
            href="/experiments/mine"
            class="flex items-center justify-center"
          >
            Status prüfen
            <Icon
              name="heroicons:arrow-right"
              class="ml-2 w-4 h-4"
            />
          </NuxtLink>
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
          {{ moderatorNotifications }}
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
            class="flex-1 shadow-md"
            @click="closeModeratorPopup"
          >
            <NuxtLink href="/experiments/review">Jetzt prüfen</NuxtLink>
          </Button>
        </div>
      </template>
    </NotificationDialog>
  </div>
</template>
