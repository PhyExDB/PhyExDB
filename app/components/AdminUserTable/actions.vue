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
  await useAuth().client.admin.banUser({ userId: user.id })
  emit("changed", { banned: true })
  toast({
    title: "Account gesperrt",
    description: `${user.name}'s Account wurde erfolgreich gesperrt.`,
    variant: "success",
  })
}
async function handleUnban() {
  await useAuth().client.admin.unbanUser({ userId: user.id })
  emit("changed", { banned: false })
  toast({
    title: "Accountsperre aufgehoben",
    description: `${user.name}'s Accountsperre wurde erfolgreich aufgehoben.`,
    variant: "success",
  })
}
async function handleDelete() {
  await useAuth().client.admin.removeUser({ userId: user.id })
  emit("deleted")
  toast({
    title: "Account gelöscht",
    description: `${user.name}'s Account wurde erfolgreich gelöscht.`,
    variant: "success",
  })
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
        <Tooltip>
          <TooltipTrigger>
            <Icon
              class="mx-1 h-4 w-4"
              name="heroicons:trash"
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>Löschen</p>
          </TooltipContent>
        </Tooltip>
      </ConfirmDeleteAlertDialog>
    </TooltipProvider>
  </div>
</template>
