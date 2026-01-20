<script setup lang="ts">
import { useToast } from "@/components/ui/toast/use-toast"

const { toast } = useToast()

const { user } = defineProps<{
  user: Pick<UserDetailAdmin, "id" | "name" | "banned">
}>()

const emit = defineEmits<{
  (e: "deleted"): void
  (e: "changed", updated: { banned: boolean }): void
}>()

async function handleImpersonate() {
  await useAuth().client.admin.impersonateUser({ userId: user.id })
  await navigateTo("/profile")
  toast({
    title: "Account imitiert",
    description: `${user.name} wird imitiert.`,
    variant: "success",
  })
}
async function handleBan() {
  try {
    await $fetch(`/api/users/${user.id}/ban`, { method: "POST" })

    emit("changed", { banned: true })

    toast({
      title: "Account gesperrt",
      description: `${user.name}'s Account wurde erfolgreich gesperrt.`,
      variant: "success",
    })
  } catch {
    toast({
      title: "Fehler beim Sperren",
      description: "Der Account konnte nicht gesperrt werden.",
      variant: "destructive",
    })
  }
}
async function handleUnban() {
  try {
    await $fetch(`/api/users/${user.id}/unban`, { method: "POST" })

    emit("changed", { banned: false })

    toast({
      title: "Accountsperre aufgehoben",
      description: `${user.name}'s Accountsperre wurde erfolgreich aufgehoben.`,
      variant: "success",
    })
  } catch {
    toast({
      title: "Fehler beim Aufheben der Sperre",
      description: "Die Accountsperre konnte nicht aufgehoben werden.",
      variant: "destructive",
    })
  }
}
async function handleDelete() {
  try {
    await $fetch(`/api/users/${user.id}/delete`, {
      method: "POST",
    })

    emit("deleted")

    toast({
      title: "Account gelöscht",
      description: `${user.name}'s Account wurde erfolgreich gelöscht.`,
      variant: "success",
    })
  } catch {
    toast({
      title: "Fehler beim Löschen",
      description: "Der Accound konnte nicht gelöscht werden.",
      variant: "destructive",
    })
  }
}
</script>

<template>
  <div class="flex flex-nowrap">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Icon
            class="mx-1 h-4 w-4"
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
            class="mx-1 h-4 w-4"
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
            class="mx-1 h-4 w-4"
            name="heroicons:no-symbol"
            @click="handleBan"
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>Bannen</p>
        </TooltipContent>
      </Tooltip>
      <ConfirmDeleteAlertDialog
        header="Löschen bestätigen"
        message="Diese Aktion kann nicht rückgängig gemacht werden. Der Account wird dauerhaft gelöscht."
        :on-delete="handleDelete"
      >
        <button type="button" class="mx-1">
          <Icon class="h-4 w-4 text-destructive" name="heroicons:trash" />
        </button>
      </ConfirmDeleteAlertDialog>
    </TooltipProvider>
  </div>
</template>
