<script setup lang="ts">
import { Pencil } from "lucide-vue-next"

const props = defineProps<{
  id: string
  role: UserRole
}>()

const emit = defineEmits<{
  (e: "changed", updated: { role: UserRole }): void
}>()

const position = ref<UserRole>(props.role)
watch(position, async (newVal) => {
  await useAuth().client.admin.setRole({
    userId: props.id,
    role: newVal as UserRole,
  })
  emit("changed", { role: newVal })
})
</script>

<template>
  <div class="flex flex-row">
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div class="flex flex-nowrap">
          <span>{{ capitalizeFirstLetter(props.role) }}</span>
          <Pencil class="w-4 h-4 ml-2" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56">
        <DropdownMenuRadioGroup v-model="position">
          <DropdownMenuRadioItem value="USER">
            User
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="MODERATOR">
            Mod
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="ADMIN">
            Admin
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
