<script lang="ts" setup>
import { Bell } from "lucide-vue-next"

const { unreadCount } = useNotifications()
</script>

<template>
  <NuxtLink
    to="/inbox"
    class="relative"
  >
    <Button
      variant="ghost"
      size="icon"
      class="relative"
    >
      <Bell class="h-5 w-5" />
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </Button>
  </NuxtLink>
</template>
