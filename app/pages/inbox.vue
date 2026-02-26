<script lang="ts" setup>
import {
  CheckCheck, Mail, MailOpen, Trash2, Bell,
  Inbox, ArrowRight,
} from "lucide-vue-next"

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

interface Config { icon: string, colorClass: string, borderClass: string }

const typeConfig: Record<string, Config> = {
  REPORT_NEW: { icon: "lucide:triangle-alert", colorClass: "text-red-600 bg-red-50", borderClass: "border-red-100" },
  REPORT_STATUS_UPDATE: { icon: "lucide:refresh-cw", colorClass: "text-blue-600 bg-blue-50", borderClass: "border-blue-100" },
  EXPERIMENT_REJECTED: { icon: "lucide:ban", colorClass: "text-orange-600 bg-orange-50", borderClass: "border-orange-100" },
  EXPERIMENT_PUBLISHED: { icon: "lucide:check-circle", colorClass: "text-emerald-600 bg-emerald-50", borderClass: "border-emerald-100" },
  REVIEW_ASSIGNED: { icon: "lucide:clipboard-check", colorClass: "text-purple-600 bg-purple-50", borderClass: "border-purple-100" },
  SYSTEM: { icon: "lucide:bell", colorClass: "text-slate-600 bg-slate-50", borderClass: "border-slate-100" },
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

async function handleToggleRead(notif: any) {
  if (notif.isRead) {
    await markAsUnread(notif.id)
  } else {
    await markAsRead(notif.id)
  }
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

async function handleLinkClick(notif: any) {
  if (!notif.isRead) {
    await markAsRead(notif.id)
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-10">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b pb-8">
      <div class="flex items-center gap-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 shadow-inner">
          <Bell class="h-6 w-6 text-primary" />
        </div>
        <div class="space-y-1">
          <h1 class="text-4xl font-black tracking-tight text-foreground">
            Postfach
          </h1>

          <div class="flex items-center gap-2">
            <Badge
              v-if="notifications?.unreadCount"
              variant="secondary"
              class="rounded-lg px-2 py-0"
            >
              <span class="mr-1 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              {{ notifications.unreadCount }} ungelesen
            </Badge>
            <span
              v-else
              class="text-sm text-muted-foreground flex items-center gap-1.5"
            >
              <CheckCheck class="h-4 w-4 text-emerald-500" />
              Keine ungelesenen Nachrichten
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="bg-muted/50 p-1 rounded-xl border flex items-center shadow-sm">
          <Button
            v-for="f in (['all', 'unread', 'read'] as const)"
            :key="f"
            :variant="activeFilter === f ? 'secondary' : 'ghost'"
            size="sm"
            class="rounded-lg h-8 text-xs font-semibold transition-all shadow-none"
            @click="activeFilter = f; page = 1"
          >
            {{ f === 'all' ? 'Alle' : f === 'unread' ? 'Neu' : 'Archiv' }}
          </Button>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="outline"
                size="icon"
                class="h-10 w-10 rounded-xl transition-colors hover:bg-primary/5 active:scale-95"
                :disabled="!notifications?.unreadCount"
                @click="handleMarkAllRead"
              >
                <CheckCheck class="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Alle als gelesen markieren</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>

    <div class="relative">
      <div
        v-if="notifications && notifications.items.length > 0"
        class="space-y-4"
      >
        <div
          v-for="notif in notifications.items"
          :key="notif.id"
          :class="[
            'group relative flex flex-col md:flex-row gap-5 rounded-2xl border p-5 transition-all duration-300',
            notif.isRead
              ? 'bg-card/40 border-border/60 grayscale-[0.2] opacity-80'
              : 'bg-card border-primary/20 shadow-lg shadow-primary/5 ring-1 ring-primary/5 hover:border-primary/40',
          ]"
        >
          <div class="flex-shrink-0 flex md:flex-col items-center justify-between md:justify-start gap-4">
            <div :class="['flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm border transition-transform group-hover:scale-105', getConfig(notif.type).colorClass, getConfig(notif.type).borderClass]">
              <Icon
                :name="getConfig(notif.type).icon"
                class="h-7 w-7"
              />
            </div>
            <time class="md:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {{ formatDate(notif.createdAt) }}
            </time>
          </div>

          <div class="flex-1 space-y-3">
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-1">
                <h3 :class="['text-base tracking-tight leading-none', notif.isRead ? 'font-medium text-foreground/70' : 'font-bold text-foreground']">
                  {{ notif.title }}
                </h3>
                <p class="text-sm text-muted-foreground leading-relaxed pr-6 line-clamp-2">
                  {{ notif.message }}
                </p>
              </div>
              <time class="hidden md:block text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-1 whitespace-nowrap">
                {{ formatDate(notif.createdAt) }}
              </time>
            </div>

            <div class="flex items-center justify-between pt-2">
              <div class="flex items-center gap-3">
                <Button
                  v-if="notif.link"
                  as-child
                  size="sm"
                  class="h-9 rounded-xl font-bold px-4 group/btn transition-all active:scale-95 shadow-sm"
                  @click="handleLinkClick(notif)"
                >
                  <NuxtLink :to="notif.link">
                    Ansehen
                    <ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </NuxtLink>
                </Button>
              </div>

              <div class="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title="Als gelesen/ungelesen markieren"
                  @click="handleToggleRead(notif)"
                >
                  <component
                    :is="notif.isRead ? Mail : MailOpen"
                    class="h-4 w-4"
                  />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  class="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Löschen"
                  @click="handleDelete(notif.id)"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="flex flex-col items-center justify-center py-32 bg-muted/10 rounded-[2rem] border-2 border-dashed border-muted/50"
      >
        <div class="h-20 w-20 bg-background rounded-3xl flex items-center justify-center mb-6 shadow-sm ring-1 ring-border">
          <Inbox class="h-10 w-10 text-muted-foreground/30" />
        </div>
        <h2 class="text-xl font-bold tracking-tight text-foreground/80 text-center px-4 text-balance">
          Alles erledigt
        </h2>
        <p class="text-sm text-muted-foreground mt-2 max-w-[240px] text-center px-4">
          {{ activeFilter === 'unread' ? 'Du hast alle neuen Nachrichten gelesen.' : 'Dein Postfach ist aktuell leer.' }}
        </p>
        <Button
          v-if="activeFilter !== 'all'"
          variant="link"
          class="mt-4"
          @click="activeFilter = 'all'"
        >
          Alle Nachrichten anzeigen
        </Button>
      </div>
    </div>

    <div
      v-if="notifications && notifications.pagination.total > 0"
      class="mt-12 flex justify-center border-t pt-8"
    >
      <MyPagination
        v-model="page"
        :page-meta="notifications.pagination"
      />
    </div>
  </div>
</template>
