<script lang="ts" setup>
import getInitials from "~~/shared/utils/initials"

const props = defineProps<{
  experiment: Pick<ExperimentList, "id" | "userId" | "status">
  comment: ExperimentComment
  user: UserDetail | null
  activeReplyId: string | null
}>()

const emit = defineEmits<{
  (e: "deleteComment" | "reply" | "vote", commentId: string): void
}>()

const isLoggedIn = computed(() => Boolean(props.user))
const isOwnComment = computed(
  () => props.comment.user.id === props.user?.id,
)

const canDelete = computed(() =>
  allowsUser(
    props.user,
    experimentCommentAbilities.delete,
    { userId: props.comment.user.id, experiment: props.experiment },
  ),
)

const canViewUser = computed(() =>
  allowsUser(props.user, userAbilities.getAll),
)

const canViewProfile = computed(
  () => canViewUser.value && !isOwnComment.value,
)

const canSeeMenu = computed(
  () => isLoggedIn.value && (canDelete.value || canViewProfile.value),
)
</script>

<template>
  <div
    class="mt-4"
    :class="{ 'ml-6 sm:ml-10 border-l-2 pl-4 border-muted/30': comment.parentId }"
  >
    <Card class="overflow-hidden transition-all duration-300 hover:shadow-lg border-muted/50 dark:bg-slate-900/50">
      <CardContent class="flex justify-between flex-col sm:flex-row p-4 gap-4">
        <div class="flex flex-col items-center gap-1.5 min-w-[44px]">
          <Button
            variant="ghost"
            size="sm"
            class="h-10 w-10 p-0 rounded-full transition-all duration-200 group relative"
            :class="[
              comment.userHasVoted
                ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20'
                : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-slate-800',
              'active:scale-90',
            ]"
            :disabled="!isLoggedIn"
            @click="emit('vote', comment.id)"
          >
            <div
              v-if="comment.userHasVoted"
              class="absolute inset-0 rounded-full bg-indigo-400/20 blur-sm animate-pulse dark:bg-indigo-500/10"
            />

            <Icon
              :name="comment.userHasVoted ? 'heroicons:chevron-up-20-solid' : 'heroicons:chevron-up'"
              class="w-6 h-6 transition-transform group-hover:-translate-y-0.5 z-10"
            />
          </Button>

          <span
            class="text-xs font-bold tabular-nums tracking-wide transition-colors duration-300"
            :class="comment.userHasVoted ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'"
          >
            {{ comment.upvotesCount }}
          </span>
        </div>
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

          <DropdownMenu v-if="user && canSeeMenu">
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
          @vote="emit('vote', $event)"
        >
          <template #reply-form>
            <slot name="reply-form" />
          </template>
        </ExperimentCommentDetail>
      </div>
    </div>
  </div>
</template>
