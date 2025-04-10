<script lang="ts" setup>
import getInitials from "~~/shared/utils/initials"

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
      <div class="flex flex-col space-y-2">
        <div class="flex flex-row items-center space-x-2">
          <Avatar>
            <AvatarFallback>{{ getInitials(comment.user.name) }}</AvatarFallback>
          </Avatar>
          <p> {{ comment.user.name }}: </p>
        </div>
        <div
          class="prose dark:prose-invert max-w-full"
          v-html="comment.text"
        />
      </div>

      <DropdownMenu
        v-if="user"
      >
        <DropdownMenuTrigger as-child>
          <Button
            variant="outline"
            size="sm"
            class="rounded-full p-1 mt-2 sm:mt-1"
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
              Zur Verfasser:in
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
