<script lang="ts" setup>
import { CheckCheck, Mail, MailOpen, Trash2, ExternalLink, Bell } from "lucide-vue-next"

await useUserOrThrowError()

const { markAsRead, markAsUnread, markAllAsRead, deleteNotification } = useNotifications()

const { page, pageSize } = getRequestPageMeta()
const activeFilter = ref<"all" | "unread" | "read">("all")

const { data: notifications, refresh } = await useLazyFetch("/api/notifications", {
  query: {
    page,
    pageSize,
    filter: activeFilter,
  },
})

interface Config { icon: string, colorClass: string }

const typeConfig: Record<string, Config> = {
  REPORT_NEW: { icon: "lucide:triangle-alert", colorClass: "bg-destructive/10 text-destructive" },
  REPORT_STATUS_UPDATE: { icon: "lucide:refresh-cw", colorClass: "bg-blue-500/10 text-blue-600" },
  EXPERIMENT_REJECTED: { icon: "lucide:ban", colorClass: "bg-orange-500/10 text-orange-600" },
  EXPERIMENT_PUBLISHED: { icon: "lucide:check-circle", colorClass: "bg-green-500/10 text-green-600" },
  REVIEW_ASSIGNED: { icon: "lucide:clipboard-check", colorClass: "bg-purple-500/10 text-purple-600" },
  SYSTEM: { icon: "lucide:bell", colorClass: "bg-gray-500/10 text-gray-600" },
}

function getConfig(type: string): Config {
  return (typeConfig[type] ?? typeConfig.SYSTEM) as Config
}

function formatDate(dateStr: string) {
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

async function handleMarkRead(id: string) {
  await markAsRead(id)
  await refresh()
}

async function handleMarkUnread(id: string) {
  await markAsUnread(id)
  await refresh()
}

async function handleDelete(id: string) {
  await deleteNotification(id)
  await refresh()
}

async function handleMarkAllRead() {
  await markAllAsRead()
  await refresh()
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Bell class="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 class="text-2xl font-bold">
            Postfach
          </h1>
          <p class="text-sm text-muted-foreground">
            {{ notifications?.unreadCount ?? 0 }} ungelesen
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="!notifications?.unreadCount"
          @click="handleMarkAllRead"
        >
          <CheckCheck class="h-4 w-4 mr-1" />
          Alle gelesen
        </Button>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="flex gap-1 mb-4 p-1 rounded-lg bg-muted w-fit">
      <Button
        v-for="f in (['all', 'unread', 'read'] as const)"
        :key="f"
        :variant="activeFilter === f ? 'default' : 'ghost'"
        size="sm"
        @click="activeFilter = f; page = 1"
      >
        {{ f === 'all' ? 'Alle' : f === 'unread' ? 'Ungelesen' : 'Gelesen' }}
      </Button>
    </div>

    <!-- Notification List -->
    <div
      v-if="notifications && notifications.items.length > 0"
      class="space-y-2"
    >
      <div
        v-for="notif in notifications.items"
        :key="notif.id"
        :class="[
          'group flex items-start gap-4 rounded-lg border p-4 transition-colors',
          notif.isRead
            ? 'bg-card border-border opacity-70'
            : 'bg-primary/[0.02] border-primary/20 shadow-sm',
        ]"
      >
        <!-- Status Dot + Icon -->
        <div class="relative flex-shrink-0">
          <div :class="['flex h-10 w-10 items-center justify-center rounded-full', getConfig(notif.type).colorClass]">
            <Icon
              :name="getConfig(notif.type).icon"
              class="h-5 w-5"
            />
          </div>
          <span
            v-if="!notif.isRead"
            class="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-background"
          />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <p :class="['text-sm leading-snug', notif.isRead ? 'font-normal' : 'font-semibold']">
              {{ notif.title }}
            </p>
            <span class="text-xs text-muted-foreground whitespace-nowrap">
              {{ formatDate(notif.createdAt) }}
            </span>
          </div>
          <p class="text-xs text-muted-foreground mt-1 line-clamp-2">
            {{ notif.message }}
          </p>

          <!-- Actions -->
          <div class="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              v-if="notif.link"
              variant="ghost"
              size="sm"
              as-child
              class="h-7 text-xs"
            >
              <NuxtLink :to="notif.link">
                <ExternalLink class="h-3 w-3 mr-1" />
                Anzeigen
              </NuxtLink>
            </Button>

            <Button
              v-if="!notif.isRead"
              variant="ghost"
              size="sm"
              class="h-7 text-xs"
              @click="handleMarkRead(notif.id)"
            >
              <MailOpen class="h-3 w-3 mr-1" />
              Gelesen
            </Button>
            <Button
              v-else
              variant="ghost"
              size="sm"
              class="h-7 text-xs"
              @click="handleMarkUnread(notif.id)"
            >
              <Mail class="h-3 w-3 mr-1" />
              Ungelesen
            </Button>

            <Button
              variant="ghost"
              size="sm"
              class="h-7 text-xs text-destructive hover:text-destructive"
              @click="handleDelete(notif.id)"
            >
              <Trash2 class="h-3 w-3 mr-1" />
              Löschen
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-20 text-muted-foreground"
    >
      <Bell class="h-12 w-12 mb-4 opacity-30" />
      <p class="text-lg font-medium">
        Keine Benachrichtigungen
      </p>
      <p class="text-sm">
        {{ activeFilter === 'unread' ? 'Alle Nachrichten wurden gelesen.' : 'Dein Postfach ist leer.' }}
      </p>
    </div>

    <!-- Pagination -->
    <MyPagination
      v-if="notifications && notifications.pagination.total > 0"
      v-model="page"
      :page-meta="notifications.pagination"
      class="mt-4"
    />
  </div>
</template>
