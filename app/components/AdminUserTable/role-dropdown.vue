<script setup lang="ts">
import { useToast } from "@/components/ui/toast/use-toast"

const { toast } = useToast()

const props = defineProps<{
  id: string
  name: string
  role: UserRole
}>()

const emit = defineEmits<{
  (e: "changed", updated: { role: UserRole }): void
}>()

const user = await useUser()
const canChangeRole = computed(() => user.value?.id !== props.id)

const position = ref<UserRole>(props.role)

watch(() => props.role, (newVal) => {
  position.value = newVal
})

async function updateRole(newVal: string) {
  const role = newVal as UserRole
  if (role === props.role) return

  try {
    await $fetch(`/api/users/${props.id}/role`, {
      method: "PUT",
      body: { role },
    })

    position.value = role
    emit("changed", { role })

    toast({
      title: "Rolle geändert",
      description: `${props.name}'s Rolle wurde erfolgreich zu ${capitalizeFirstLetter(role)} geändert.`,
      variant: "success",
    })
  } catch {
    position.value = props.role
    toast({
      title: "Fehler beim Ändern der Rolle",
      description: "Die Rolle konnte nicht aktualisiert werden. Bitte versuche es erneut.",
      variant: "destructive",
    })
  }
}
</script>

<template>
  <div class="flex flex-row">
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div class="flex flex-nowrap">
          <span>{{ capitalizeFirstLetter(position) }}</span>
          <Icon
            v-if="canChangeRole"
            size="1.2em"
            class="m-0.5 ml-1"
            name="heroicons:pencil"
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        v-if="canChangeRole"
        class="w-56"
      >
        <DropdownMenuRadioGroup
          :model-value="position"
          @update:model-value="updateRole"
        >
          <DropdownMenuRadioItem value="USER">
            User
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="MODERATOR">
            Moderator
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="ADMIN">
            Admin
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
