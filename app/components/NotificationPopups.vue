<script lang="ts" setup>
const userRef = await useUser()
const user = userRef.value
const { data } = await useFetch("/api/notifications/check")
const showUserPopup = ref(false)
const showModeratorPopup = ref(false)
const publishedCount = computed(() => data.value?.publishedCount ?? 0)
const needsRevisionCount = computed(() => data.value?.needsRevisionCount ?? 0)

onMounted(() => {
  if (!data.value || !user) return

  const lastUserSeen = Number(localStorage.getItem("last-user-notif-seen") || 0)
  const serverUserUpdate = Number(data.value.lastUpdate || 0)

  if (data.value.userNotifications > 0 && serverUserUpdate > lastUserSeen) {
    showUserPopup.value = true
  }
  else {
    checkModeratorPopup()
  }
})

function checkModeratorPopup() {
  const lastModSeen = Number(localStorage.getItem("last-mod-notif-seen") || 0)
  const serverModUpdate = Number(data.value?.moderatorLastUpdate || 0)
  if (data.value && data.value.moderatorNotifications > 0 && serverModUpdate > lastModSeen) {
    showModeratorPopup.value = true
  }
}

function closeUserPopup() {
  showUserPopup.value = false
  if (data.value?.lastUpdate) {
    localStorage.setItem("last-user-notif-seen", data.value.lastUpdate.toString())
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
        @update:open="(val) => { if (!val) closeUserPopup() }"
        icon-name="heroicons:bell-alert"
        title="Review-Update"
        description="Es gibt Neuigkeiten zu deinen Versuchen."
    >
      <div class="space-y-3">
        <div
            v-if="publishedCount > 0"
            class="flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-sm"
        >
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <Icon name="heroicons:check-badge" class="h-6 w-6" />
          </div>
          <div>
            <p class="text-sm font-semibold">Veröffentlicht</p>
            <p class="text-xs text-muted-foreground">
              {{ publishedCount === 1 ? 'Ein Versuch ist' : `${publishedCount} Versuche sind` }} live.
            </p>
          </div>
        </div>

        <div
            v-if="needsRevisionCount > 0"
            class="flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-sm"
        >
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
            <Icon name="heroicons:pencil-square" class="h-6 w-6" />
          </div>
          <div>
            <p class="text-sm font-semibold">Korrekturwunsch</p>
            <p class="text-xs text-muted-foreground">
              {{ needsRevisionCount === 1 ? 'Ein Versuch benötigt' : `${needsRevisionCount} Versuche benötigen` }} eine Überarbeitung.
            </p>
          </div>
        </div>
      </div>

      <template #footer>
        <Button as-child class="w-full py-6 shadow-md" @click="closeUserPopup">
          <NuxtLink href="/experiments/mine" class="flex items-center justify-center">
            Status prüfen
            <Icon name="heroicons:arrow-right" class="ml-2 w-4 h-4" />
          </NuxtLink>
        </Button>
      </template>
    </NotificationDialog>

    <NotificationDialog
        :open="showModeratorPopup"
        @update:open="(val) => { if (!val) closeModeratorPopup() }"
        icon-name="heroicons:clipboard-document-list"
        title="Warteschlange"
        description="Neue Aufgaben stehen an."
    >
      <div class="rounded-xl bg-muted/50 p-6 text-center border">
        <span class="text-6xl font-light tracking-tighter text-foreground">
          {{ data?.moderatorNotifications }}
        </span>
        <p class="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">Offene Reviews</p>
      </div>

      <template #footer>
        <div class="flex gap-3">
          <Button variant="outline" class="flex-1" @click="closeModeratorPopup">Später</Button>
          <Button as-child class="flex-1 shadow-md" @click="closeModeratorPopup">
            <NuxtLink href="/experiments/review">Jetzt prüfen</NuxtLink>
          </Button>
        </div>
      </template>
    </NotificationDialog>
  </div>
</template>