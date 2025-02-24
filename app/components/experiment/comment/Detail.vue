<script lang="ts" setup>
const props = defineProps<{
  experiment: Pick<ExperimentList, "id" | "userId" | "status">
  comment: ExperimentComment
  user: UserDetail | null
}>()

const user = props.user
const canDelete = allowsUser(
  user,
  experimentCommentAbilities.delete,
  { userId: props.comment.user.id, experiment: props.experiment },
)
const canViewUser = allowsUser(user, userAbilities.getAll)

const emit = defineEmits<{
  (e: "deleteComment", commentId: string): void
}>()
</script>

<template>
  <Card class="mt-4">
    <CardContent class="flex justify-between flex-col sm:flex-row p-4">
      <p class="break-words">
        {{ comment.user.name }}:
        {{ comment.text }}
      </p>

      <DropdownMenu
        v-if="user"
      >
        <DropdownMenuTrigger as-child>
          <Button
            variant="outline"
            size="sm"
            class="rounded-full p-1"
          >
            <Icon
              name="heroicons:ellipsis-horizontal"
              class="w-6 h-6 text-muted-foreground"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            v-if="canViewUser && comment.user.id !== user?.id"
            @click="navigateTo(`/users?search=${comment.user.id}`)"
          >
            <span>
              zu Verfasser
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            v-if="canDelete"
            class="text-destructive"
            @click="emit('deleteComment', comment.id)"
          >
            <span>
              Kommentar Löschen
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CardContent>
  </Card>
</template>
