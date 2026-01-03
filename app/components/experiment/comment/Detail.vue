<script lang="ts" setup>
import getInitials from "~~/shared/utils/initials"

const props = defineProps<{
  experiment: Pick<ExperimentList, "id" | "userId" | "status">
  comment: ExperimentComment
  user: UserDetail | null
  activeReplyId: string | null
}>()

const user = props.user
const canDelete = allowsUser(
  user,
  experimentCommentAbilities.delete,
  { userId: props.comment.user.id, experiment: props.experiment },
)
const canViewUser = allowsUser(user, userAbilities.getAll)

const emit = defineEmits<{
  (e: "deleteComment" | "reply", commentId: string): void
}>()
</script>

<template>
  <div
    class="mt-4"
    :class="{ 'ml-6 sm:ml-10 border-l-2 pl-4': comment.parentId }"
  >
    <Card>
      <CardContent class="flex justify-between flex-col sm:flex-row p-4 gap-4">
        <div class="flex flex-col space-y-2 flex-grow">
          <div class="flex flex-row items-center space-x-2">
            <Avatar class="w-8 h-8">
              <AvatarFallback class="text-xs">
                {{ getInitials(comment.user.name) }}
              </AvatarFallback>
            </Avatar>
            <p class="font-bold text-sm">
              {{ comment.user.name }}
            </p>
          </div>
          <div
            class="prose dark:prose-invert max-w-full text-sm"
            v-html="comment.text"
          />
        </div>

        <div class="flex items-center space-x-2 self-end sm:self-start">
          <Button
            v-if="user && !comment.parentId"
            variant="ghost"
            size="sm"
            class="text-xs h-8"
            @click="emit('reply', comment.id)"
          >
            Antworten
          </Button>

          <DropdownMenu v-if="user">
            <DropdownMenuTrigger as-child>
              <Button
                variant="ghost"
                size="sm"
                class="h-8 w-8 p-0"
              >
                <Icon
                  name="heroicons:ellipsis-horizontal"
                  class="w-5 h-5"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                v-if="canViewUser && comment.user.id !== user?.id"
                @click="navigateTo(`/users?search=${comment.user.id}`)"
              >
                Profil ansehen
              </DropdownMenuItem>
              <DropdownMenuItem
                v-if="canDelete"
                class="text-destructive"
                @click="emit('deleteComment', comment.id)"
              >
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>

    <div
      v-if="activeReplyId === comment.id"
      class="mt-2 ml-4"
    >
      <slot name="reply-form" />
    </div>

    <div v-if="comment.children && comment.children.length > 0">
      <div
        v-for="child in comment.children"
        :key="child.id"
      >
        <ExperimentCommentDetail
          :experiment="experiment"
          :comment="child"
          :user="user"
          :active-reply-id="activeReplyId"
          @delete-comment="emit('deleteComment', $event)"
          @reply="emit('reply', $event)"
        >
          <template #reply-form>
            <slot name="reply-form" />
          </template>
        </ExperimentCommentDetail>
      </div>
    </div>
  </div>
</template>
