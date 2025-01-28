<script setup lang="ts">
import { MoreHorizontal } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

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

const isDialogOpen = ref(false)
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
      <DropdownMenuItem @click="() => isDialogOpen = true">
        Löschen
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <AlertDialog :open="isDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sind Sie sich sicher?</AlertDialogTitle>
          <AlertDialogDescription>
            Diese Aktion kann nicht rückgängig gemacht werden. Der Account wird dauerhaft gelöscht.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="isDialogOpen = false">Abbrechen</AlertDialogCancel>
          <AlertDialogAction @click="isDialogOpen = false; handleDelete()">Weiter</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
</template>
