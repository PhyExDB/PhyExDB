<script setup lang="ts">
// import { Button } from '@/components/ui/button'
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
// import { MoreHorizontal } from 'lucide-vue-next'
import { Pencil } from "lucide-vue-next"

const props = defineProps<{
  id: string
  role: UserRole
}>()

const emit = defineEmits(["role-changed"])

const position = ref<UserRole>(props.role)
watch(position, async (newVal) => {
  await useAuth().client.admin.setRole({
    userId: props.id,
    role: newVal as UserRole,
  })
  emit("role-changed", newVal)
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
