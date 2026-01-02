<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { ExperimentCommentDetail } from "#components"

const props = defineProps<{
  experiment: Pick<ExperimentList, "id" | "userId" | "status">
}>()
const id = computed(() => props.experiment.id)
const { page, pageSize } = getRequestPageMeta()

const { data, refresh } = useLazyFetch<Page<ExperimentComment> | null>(`/api/experiments/${id.value}/comments`, {
  query: {
    page: page,
    pageSize: pageSize,
  },
})

const user = await useUser()
const replyingToId = ref<string | null>(null)
const loading = ref(false)
const commented = ref(0)

const canComment = computed(() => data.value && allowsUser(
  user.value,
  experimentCommentAbilities.post,
  { ...props.experiment, commentsEnabled: true },
))
const canEnable = allowsUser(user.value, experimentCommentAbilities.enable, props.experiment)

async function deleteComment(commentId: string) {
  await useFetch(`/api/experiments/${id.value}/comments/${commentId}`, {
    method: "DELETE",
  })
  if (data.value?.items.length === 1 && page.value > 1) {
    page.value = page.value - 1
  }
  await refresh()
}

const formSchema = toTypedSchema(experimentCommentCreateSchema)
const form = useForm({ validationSchema: formSchema })

const isTextEmpty = computed(() => {
  const text = form.values.text || ""
  return text.replace(/<[^>]*>/g, "").trim().length === 0
})

const onSubmit = form.handleSubmit(async (values) => {
  if (isTextEmpty.value || loading.value) return
  loading.value = true
  try {
    await $fetch(`/api/experiments/${id.value}/comments`, {
      method: "POST",
      body: {
        text: values.text,
        ...(replyingToId.value ? { parentId: replyingToId.value } : {}),
      },
    })

    form.resetForm()
    replyingToId.value = null
    commented.value = 1 - commented.value
    page.value = 1
    await refresh()
  } catch (e) {
    console.error("Submission failed", e)
  } finally {
    loading.value = false
  }
})

function setReply(commentId: string) {
  replyingToId.value = commentId
  document.getElementById("comment-anchor")?.scrollIntoView({ behavior: "smooth" })
}

async function enableComments(enable: boolean) {
  await $fetch(`/api/experiments/${id.value}/comments/enable`, {
    method: "PUT",
    body: { enable },
  })
  refresh()
}
</script>

<template>
  <div v-if="data">
    <div id="comment-anchor" />

    <div
      v-if="canComment"
      class="mb-8"
    >
      <div
        v-if="replyingToId"
        class="flex justify-between items-center bg-accent/50 p-2 rounded-t-md border-x border-t"
      >
        <span class="text-sm font-medium italic">Antwort verfassen...</span>
        <Button
          variant="ghost"
          size="sm"
          class="h-7"
          @click="replyingToId = null"
        >
          Abbrechen
        </Button>
      </div>

      <form
        class="flex flex-col gap-4 border p-4 bg-card"
        :class="replyingToId ? 'rounded-b-lg border-t-0' : 'rounded-lg'"
        @submit="onSubmit"
      >
        <FormField
          v-slot="{ componentField }"
          name="text"
        >
          <FormItem>
            <FormLabel
              class="text-xl font-bold transition-colors duration-100"
            >
              {{ replyingToId ? 'Deine Antwort' : 'Neuer Kommentar' }}
            </FormLabel>
            <FormControl>
              <TipTapEditor
                id="text"
                v-bind="componentField"
                :key="commented"
                default-value=""
                :show-headings="false"
                editor-class="p-4 h-40 overflow-auto bg-background focus:outline-none"
              />
            </FormControl>
          </FormItem>
        </FormField>

        <div class="flex items-center justify-end gap-3 h-10">
          <Button
            variant="default"
            type="submit"
            :disabled="loading || isTextEmpty"
            class="transition-all active:scale-95"
          >
            <Icon
              v-if="loading"
              name="lucide:loader-2"
              class="mr-2 h-4 w-4 animate-spin"
            />
            {{ replyingToId ? 'Antwort senden' : 'Kommentieren' }}
          </Button>
        </div>
      </form>
    </div>

    <div class="mt-10">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-extrabold tracking-tight">
          Kommentare
        </h1>
        <Button
          v-if="canEnable"
          variant="ghost"
          size="sm"
          class="text-muted-foreground"
          @click="enableComments(false)"
        >
          Deaktivieren
        </Button>
      </div>

      <div
        v-for="comment in data?.items"
        :key="comment.id"
      >
        <ExperimentCommentDetail
          v-if="!comment.parentId"
          :experiment="experiment"
          :comment="comment"
          :user="user"
          @delete-comment="deleteComment"
          @reply="setReply"
        />
      </div>

      <div
        v-if="data?.pagination.total === 0"
        class="text-muted-foreground py-16 text-center border-2 border-dashed rounded-xl"
      >
        Bisher gibt es keine Kommentare.
      </div>

      <MyPagination
        v-model="page"
        :page-meta="data?.pagination"
        class="mt-8"
      />
    </div>
  </div>
  <div
    v-else
    class="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl text-muted-foreground"
  >
    <Icon
      name="lucide:message-square-off"
      class="w-12 h-12 mb-4 opacity-20"
    />
    <p>Die Kommentarfunktion ist für diesen Versuch deaktiviert.</p>
    <Button
      v-if="canEnable"
      variant="outline"
      class="mt-4"
      @click="enableComments(true)"
    >
      Kommentare für diesen Versuch erlauben
    </Button>
  </div>
</template>
