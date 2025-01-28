<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const { user } = defineProps<{
  user: Pick<UserDetailAdmin, "id" | "banned">
}>()

const emit = defineEmits<{
  (e: "deleted"): void
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
  <div class="flex flex-nowrap">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Icon
            class="ml-2 h-4 w-4"
            name="heroicons:eye"
            @click="handleImpersonate"
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>Imitieren</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip v-if="user.banned">
        <TooltipTrigger>
          <Icon
            class="ml-2 h-4 w-4"
            name="heroicons:check"
            @click="handleUnban"
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>Ban aufheben</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip v-if="!user.banned">
        <TooltipTrigger>
          <Icon
            class="ml-2 h-4 w-4"
            name="heroicons:no-symbol"
            @click="handleBan"
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>Bannen</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
          <Icon
            class="ml-2 h-4 w-4"
            name="heroicons:trash"
            @click="isDialogOpen = true"
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>Löschen</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>

  <AlertDialog :open="isDialogOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Sind Sie sich sicher?</AlertDialogTitle>
        <AlertDialogDescription>
          Diese Aktion kann nicht rückgängig gemacht werden. Der Account wird dauerhaft gelöscht.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="isDialogOpen = false">
          Abbrechen
        </AlertDialogCancel>
        <AlertDialogAction @click="isDialogOpen = false; handleDelete()">
          Weiter
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
