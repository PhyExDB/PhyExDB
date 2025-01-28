<script setup lang="ts">
import { MoreHorizontal } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const { user } = defineProps<{
  user: Pick<UserDetailAdmin, "id" | "banned">
}>()

const emit = defineEmits<{ 
  (e: "deleted"): void, 
  (e: "changed", updated: { banned: boolean }): void
}>()

async function handleImpersonate() {
  await useAuth().client.admin.impersonateUser({ userId: user.id })
  await navigateTo("/profile")
}
async function handleBan() {
  await useAuth().client.admin.banUser({ userId: user.id })
  emit("changed", { banned: true })
}
async function handleUnban() {
  await useAuth().client.admin.unbanUser({ userId: user.id })
  emit("changed", { banned: false })
}
async function handleDelete() {
  await useAuth().client.admin.removeUser({ userId: user.id })
  emit("deleted")
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        class="w-8 h-8 p-0"
      >
        <span class="sr-only">Open menu</span>
        <MoreHorizontal class="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="handleImpersonate">
        Imitieren
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem v-if="!user.banned" @click="handleBan">
        Bannen
      </DropdownMenuItem>
      <DropdownMenuItem v-if="user.banned" @click="handleUnban">
        Unbannen
      </DropdownMenuItem>
      <DropdownMenuItem @click="handleDelete">
        Löschen
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
