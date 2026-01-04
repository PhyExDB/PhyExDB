<script lang="ts" setup>
const userRef = await useUser()
const user = userRef.value
const { data } = await useFetch("/api/notifications/check")
const showUserPopup = ref(false)
const showModeratorPopup = ref(false)

onMounted(() => {
  if (data.value && user) {
    const lastSeenUserUpdate = localStorage.getItem("last-user-notif-update")
    const currentServerUpdate = data.value.lastUpdate?.toString()

    // Zeige Popup, wenn es ungelesene Benachrichtigungen gibt UND
    // entweder noch nie gesehen wurde ODER ein neues Update vom Server vorliegt
    if (data.value.userNotifications > 0) {
      if (!lastSeenUserUpdate || lastSeenUserUpdate !== currentServerUpdate) {
        showUserPopup.value = true
      }
    }

    const lastSeenModCount = Number(localStorage.getItem("last-mod-notif-count") || 0)
    if (data.value.moderatorNotifications > lastSeenModCount) {
      showModeratorPopup.value = true
    }
  }
})

function closeUserPopup() {
  showUserPopup.value = false
  if (data.value?.lastUpdate) {
    localStorage.setItem("last-user-notif-update", data.value.lastUpdate.toString())
  }
}

function closeModeratorPopup() {
  showModeratorPopup.value = false
  if (data.value) {
    localStorage.setItem("last-mod-notif-count", data.value.moderatorNotifications.toString())
  }
}
</script>

<template>
  <div>
    <Dialog
      :open="showUserPopup"
      @update:open="closeUserPopup"
    >
      <DialogContent>
        <DialogHeader>
          <div class="flex items-center gap-2">
            <Icon
              name="heroicons:bell"
              class="w-6 h-6 text-primary"
            />
            <DialogTitle>Update zu deinen Versuchen</DialogTitle>
          </div>
          <DialogDescription class="pt-2">
            Es gibt Neuigkeiten zu deinem Review-Prozess:
            <ul class="list-disc list-inside mt-2 space-y-1">
              <li>Einige Versuche wurden <strong>veröffentlicht</strong> 🎉</li>
              <li>Andere benötigen eventuell noch <strong>Überarbeitungen</strong>.</li>
            </ul>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button
            variant="outline"
            @click="closeUserPopup"
          >
            Schließen
          </Button>
          <Button
            as-child
            @click="closeUserPopup"
          >
            <NuxtLink href="/experiments/mine">Zu meinen Versuchen</NuxtLink>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog
      :open="showModeratorPopup"
      @update:open="closeModeratorPopup"
    >
      <DialogContent>
        <DialogHeader>
          <div class="flex items-center gap-2">
            <Icon
              name="heroicons:clipboard-document-check"
              class="w-6 h-6 text-primary"
            />
            <DialogTitle>Review-Warteschlange</DialogTitle>
          </div>
          <DialogDescription class="pt-2">
            Es warten <strong>{{ data?.moderatorNotifications }}</strong> Versuche auf deine Überprüfung.
            <span v-if="data?.moderatorNotifications === 1"> Davon wartet einer bereits auf die finale zweite Bestätigung.</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button
            variant="outline"
            @click="closeModeratorPopup"
          >
            Später
          </Button>
          <Button
            as-child
            @click="closeModeratorPopup"
          >
            <NuxtLink href="/experiments/review">Review-Liste öffnen</NuxtLink>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
