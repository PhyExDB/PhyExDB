<script lang="ts" setup>
const userRef = await useUser()
const user = userRef.value

const { data } = await useFetch("/api/notifications/check")

const showUserPopup = ref(false)
const showModeratorPopup = ref(false)

onMounted(() => {
  if (data.value && user) {
    if (data.value.userNotifications > 0) {
      if (!sessionStorage.getItem("user-review-popup-seen")) {
        showUserPopup.value = true
      }
    }
    if (data.value.moderatorNotifications > 0) {
      if (!sessionStorage.getItem("moderator-review-popup-seen")) {
        showModeratorPopup.value = true
      }
    }
  }
})

function closeUserPopup() {
  showUserPopup.value = false
  sessionStorage.setItem("user-review-popup-seen", "true")
}

function closeModeratorPopup() {
  showModeratorPopup.value = false
  sessionStorage.setItem("moderator-review-popup-seen", "true")
}
</script>

<template>
  <div>
    <!-- User Notification Popup -->
    <Dialog
      :open="showUserPopup"
      @update:open="closeUserPopup"
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Experiment-Review</DialogTitle>
          <DialogDescription>
            Einer deiner Versuche wurde bereits zweimal reviewed. Schau dir das Feedback an, um ihn zu verbessern.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button @click="closeUserPopup">
            Schließen
          </Button>
          <NuxtLink href="/experiments/mine">
            <Button @click="closeUserPopup">Meine Versuche</Button>
          </NuxtLink>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Moderator/Admin Notification Popup -->
    <Dialog
      :open="showModeratorPopup"
      @update:open="closeModeratorPopup"
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neue Versuche zum Review</DialogTitle>
          <DialogDescription>
            Es gibt Versuche, die auf eine Überprüfung warten.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            @click="closeModeratorPopup"
          >
            Später
          </Button>
          <NuxtLink href="/experiments/review">
            <Button @click="closeModeratorPopup">Zu den Reviews</Button>
          </NuxtLink>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
