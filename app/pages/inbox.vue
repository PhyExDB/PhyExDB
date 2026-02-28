<script lang="ts" setup>
import { CheckCheck, Mail, MailOpen, Trash2, Bell, Inbox, ArrowRight } from "lucide-vue-next"
import type { Notification, NotificationResponse, NotificationType } from "~~/shared/types/Notification.type"

await useUserOrThrowError()
const { markAsRead, markAsUnread, markAllAsRead, deleteNotification, unreadCount } = useNotifications()

const { page, pageSize } = getRequestPageMeta()
const activeFilter = ref<"all" | "unread" | "read">("all")

const { data: notifications, refresh } = await useLazyFetch<NotificationResponse>("/api/notifications", {
  query: { page, pageSize, filter: activeFilter },
})

const typeConfig: Record<NotificationType, { icon: string, color: string, bg: string }> = {
  REPORT_NEW: { icon: "lucide:triangle-alert", color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
  REPORT_STATUS_UPDATE: { icon: "lucide:refresh-cw", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  EXPERIMENT_REJECTED: { icon: "lucide:ban", color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20" },
  EXPERIMENT_PUBLISHED: { icon: "lucide:check-circle", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  REVIEW_ASSIGNED: { icon: "lucide:clipboard-check", color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
  SYSTEM: { icon: "lucide:bell", color: "text-muted-foreground", bg: "bg-muted border-border" },
}

const formatDate = (dateStr: string | Date) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return "Gerade eben"
  if (diffMin < 60) return `vor ${diffMin} Min.`
  if (diffHours < 24) return `vor ${diffHours} Std.`
  if (diffDays < 7) return `vor ${diffDays} Tagen`
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
}

const handleToggleRead = async (notif: Notification) => {
  if (notif.isRead) {
    await markAsUnread(notif.id)
  } else {
    await markAsRead(notif.id)
  }
  await refresh()
  unreadCount.value = notifications.value?.unreadCount ?? 0
}

const handleDelete = async (id: string) => {
  await deleteNotification(id)
  await refresh()
  unreadCount.value = notifications.value?.unreadCount ?? 0
}

const handleMarkAllRead = async () => {
  await markAllAsRead()
  await refresh()
  unreadCount.value = 0
}

const handleLinkClick = async (notif: Notification) => {
  if (!notif.isRead) {
    await markAsRead(notif.id)
    await refresh()
    unreadCount.value = notifications.value?.unreadCount ?? 0
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl p-6 lg:py-10">
    <header class="flex flex-wrap items-center justify-between gap-4 border-b pb-8">
      <div class="flex items-center gap-4">
        <div class="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
          <Bell class="size-6" />
        </div>
        <div>
          <h1 class="text-3xl font-bold tracking-tight">
            Postfach
          </h1>
          <div class="mt-1 flex items-center gap-2 text-sm">
            <Badge
              v-if="notifications?.unreadCount"
              variant="secondary"
              class="gap-1.5 rounded-md px-1.5 py-0"
            >
              <span class="size-1.5 rounded-full bg-primary animate-pulse" />
              {{ notifications.unreadCount }} neu
            </Badge>
            <span
              v-else
              class="flex items-center gap-1.5 text-muted-foreground"
            >
              <CheckCheck class="size-4 text-emerald-500" /> Alles gelesen
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <div class="inline-flex items-center rounded-lg border bg-muted/50 p-1">
          <Button
            v-for="f in (['all', 'unread', 'read'] as const)"
            :key="f"
            variant="ghost"
            size="sm"
            :class="['h-7 px-3 text-xs font-medium', activeFilter === f && 'bg-background shadow-sm hover:bg-background']"
            @click="activeFilter = f; page = 1"
          >
            {{ f === 'all' ? 'Alle' : f === 'unread' ? 'Neu' : 'Archiv' }}
          </Button>
        </div>
        <Button
          variant="outline"
          size="icon"
          class="rounded-lg"
          :disabled="!notifications?.unreadCount"
          @click="handleMarkAllRead"
        >
          <CheckCheck class="size-4" />
        </Button>
      </div>
    </header>

    <main class="mt-8 space-y-4">
      <template v-if="notifications?.items.length">
        <div
          v-for="notif in notifications.items"
          :key="notif.id"
          :class="[
            'relative flex flex-col gap-4 rounded-xl border p-4 transition-all md:flex-row',
            notif.isRead ? 'bg-muted/30 opacity-75' : 'bg-card shadow-sm ring-1 ring-primary/5',
          ]"
        >
          <div :class="['flex size-12 shrink-0 items-center justify-center rounded-xl border shadow-sm', typeConfig[notif.type].bg]">
            <Icon
              :name="typeConfig[notif.type].icon"
              :class="['size-6', typeConfig[notif.type].color]"
            />
          </div>

          <div class="flex-1 space-y-1">
            <div class="flex items-start justify-between gap-2">
              <div class="space-y-1">
                <h3 :class="['text-sm leading-none', !notif.isRead ? 'font-bold' : 'font-medium text-foreground/70']">
                  {{ notif.title }}
                </h3>
                <p class="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {{ notif.message }}
                </p>
              </div>
              <time class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pt-0.5">
                {{ formatDate(notif.createdAt) }}
              </time>
            </div>

            <div class="flex items-center justify-between pt-3">
              <Button
                v-if="notif.link"
                as-child
                size="sm"
                variant="secondary"
                class="h-8 gap-2 rounded-lg px-3 font-semibold"
                @click="handleLinkClick(notif)"
              >
                <NuxtLink :to="notif.link">
                  Ansehen <ArrowRight class="size-3.5" />
                </NuxtLink>
              </Button>
              <div v-else />

              <div class="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  class="size-8 text-muted-foreground"
                  @click="handleToggleRead(notif)"
                >
                  <component
                    :is="notif.isRead ? Mail : MailOpen"
                    class="size-4"
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  @click="handleDelete(notif.id)"
                >
                  <Trash2 class="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div
        v-else
        class="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed py-24 text-center bg-muted/5"
      >
        <div class="flex size-16 items-center justify-center rounded-2xl bg-muted/50 mb-4 ring-1 ring-border">
          <Inbox class="size-8 text-muted-foreground/40" />
        </div>
        <h2 class="text-lg font-semibold tracking-tight">
          Postfach leer
        </h2>
        <p class="text-sm text-muted-foreground max-w-xs mx-auto">
          {{ activeFilter === 'unread' ? 'Keine neuen Nachrichten vorhanden.' : 'Du hast derzeit keine Nachrichten in deinem Postfach.' }}
        </p>
        <Button
          v-if="activeFilter !== 'all'"
          variant="link"
          class="mt-2"
          @click="activeFilter = 'all'"
        >
          Alle anzeigen
        </Button>
      </div>
    </main>

    <footer
      v-if="notifications?.pagination.total"
      class="mt-10 border-t pt-8 flex justify-center"
    >
      <MyPagination
        v-model="page"
        :page-meta="notifications.pagination"
      />
    </footer>
  </div>
</template>
