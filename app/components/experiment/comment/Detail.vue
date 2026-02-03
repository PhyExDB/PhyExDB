<script lang="ts" setup>
import getInitials from "~~/shared/utils/initials"

const props = defineProps<{
  experiment: Pick<ExperimentList, "id" | "userId" | "status">
  comment: ExperimentComment
  user: UserDetail | null
  activeReplyId: string | null
}>()

const emit = defineEmits<{
  (e: "deleteComment" | "reply", commentId: string): void
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

const selectedImage = ref<string | null>(null)

function handleImageClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target.tagName === "IMG" && (target.classList.contains("editor-attachment") || target.closest(".attachments-container"))) {
    selectedImage.value = (target as HTMLImageElement).src
  }
}
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
            @click="handleImageClick"
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
        >
          <template #reply-form>
            <slot name="reply-form" />
          </template>
        </ExperimentCommentDetail>
      </div>
    </div>
  </div>

  <!-- Lightbox Dialog -->
  <Dialog :open="!!selectedImage" @update:open="selectedImage = null">
    <DialogContent class="max-w-[90vw] max-h-[90vh] p-0 border-none bg-transparent shadow-none flex items-center justify-center">
      <img
        v-if="selectedImage"
        :src="selectedImage"
        class="max-w-full max-h-full object-contain rounded-lg"
        @click="selectedImage = null"
      >
    </DialogContent>
  </Dialog>
</template>
