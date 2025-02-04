<script setup lang="ts">
import { useToast } from "@/components/ui/toast/use-toast"
import { computed } from "vue"

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
watch(position, async (newVal) => {
  await useAuth().client.admin.setRole({
    userId: props.id,
    role: newVal as UserRole,
  })
  emit("changed", { role: newVal })
  toast({
    title: "Rolle geändert",
    description: `${props.name}'s Rolle wurde erfolgreich zu ${capitalizeFirstLetter(newVal)} geändert.`,
    variant: "success",
  })
})
</script>

<template>
  <div class="flex flex-row">
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div class="flex flex-nowrap">
          <span>{{ capitalizeFirstLetter(props.role) }}</span>
          <Icon
            v-if="canChangeRole"
            size="1.2em"
            class="m-0.5 ml-1"
            name="heroicons:pencil"
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56" v-if="canChangeRole">
        <DropdownMenuRadioGroup v-model="position">
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
