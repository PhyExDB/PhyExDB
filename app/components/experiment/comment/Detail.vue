<script lang="ts" setup>
const props = defineProps<{
  experiment: Pick<ExperimentList, "id" | "userId" | "status">
  comment: ExperimentComment
}>()

const canDelete = await allows(experimentCommentAbilities.delete, { userId: props.comment.user.id, experiment: props.experiment })

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

            <Button
                v-if="canDelete"
                variant="outline"
                @click="emit('deleteComment', comment.id)"
            >
                Kommentar löschen
            </Button>
        </CardContent>
    </Card>
</template>
