<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { z } from "zod"
import { ExperimentCommentDetail } from "#components"

const props = defineProps<{
  experiment: Pick<ExperimentList, "id" | "userId" | "status">
}>()
const id = computed(() => props.experiment.id)
const { page, pageSize } = getRequestPageMeta()

const { data, refresh } = useLazyFetch<Page<ExperimentComment> | null>(`/api/experiments/${id.value}/comments`, {
  query: { page, pageSize },
})

const user = await useUser()
const replyingToId = ref<string | null>(null)
const loading = ref(false)
const commented = ref(0)

const hasTextContent = (html: string | undefined) => {
  if (!html) return false
  const doc = new DOMParser().parseFromString(html, "text/html")
  return (doc.body.textContent || "").trim().length > 0
}

const formSchema = toTypedSchema(z.object({
  text: z.string().optional(),
}))

const { handleSubmit, values, setFieldValue, errors, resetForm, setFieldError } = useForm({
  validationSchema: formSchema,
  initialValues: { text: "" },
})

const onSubmit = handleSubmit(async (formValues) => {
  if (!hasTextContent(formValues.text)) {
    setFieldError("text", "Bitte gib einen Kommentar ein.")
    return
  }

  if (loading.value) return
  loading.value = true
  try {
    await $fetch(`/api/experiments/${id.value}/comments`, {
      method: "POST",
      body: {
        text: formValues.text,
        ...(replyingToId.value ? { parentId: replyingToId.value } : {}),
      },
    })

    resetForm()
    replyingToId.value = null
    commented.value++
    page.value = 1
    await refresh()
  } catch (e) {
    console.error("Submission failed", e)
  } finally {
    loading.value = false
  }
})

async function deleteComment(commentId: string) {
  await useFetch(`/api/experiments/${id.value}/comments/${commentId}`, { method: "DELETE" })
  if (data.value?.items.length === 1 && page.value > 1) {
    page.value = page.value - 1
  }
  await refresh()
}

function setReply(commentId: string) {
  setFieldValue("text", "")
  replyingToId.value = commentId
}

async function enableComments(enable: boolean) {
  await $fetch(`/api/experiments/${id.value}/comments/enable`, {
    method: "PUT",
    body: { enable },
  })
  refresh()
}

const canComment = computed(() => data.value && allowsUser(
  user.value,
  experimentCommentAbilities.post,
  { ...props.experiment, commentsEnabled: true },
))
const canEnable = allowsUser(user.value, experimentCommentAbilities.enable, props.experiment)
</script>

<template>
  <div v-if="data">
    <div id="comment-anchor" />

    <div
      v-if="canComment && !replyingToId"
      class="mb-8"
    >
      <form
        class="flex flex-col gap-4 border p-4 bg-card rounded-lg"
        @submit="onSubmit"
      >
        <h2 class="text-xl font-bold">
          Neuer Kommentar
        </h2>
        <FormField
          v-slot="{ componentField, errorMessage }"
          name="text"
        >
          <FormItem>
            <FormControl>
              <TipTapEditor
                id="main-editor"
                v-bind="componentField"
                :key="`main-${commented}`"
                :show-headings="false"
                :class="{ 'border-destructive ring-1 ring-destructive': errorMessage }"
                editor-class="p-4 h-40 overflow-auto bg-background focus:outline-none"
              />
            </FormControl>
            <p
              v-if="errorMessage"
              class="text-sm font-medium text-destructive mt-1 animate-in fade-in slide-in-from-top-1"
            >
              {{ errorMessage }}
            </p>
          </FormItem>
        </FormField>

        <div class="flex items-center justify-end gap-3 h-10">
          <Button
            variant="default"
            type="submit"
            :disabled="loading"
          >
            <Icon
              v-if="loading"
              name="lucide:loader-2"
              class="mr-2 h-4 w-4 animate-spin"
            />
            Kommentieren
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
        :key="String(comment.id)"
      >
        <ExperimentCommentDetail
          v-if="!comment.parentId"
          :experiment="experiment"
          :comment="comment"
          :user="user"
          :active-reply-id="replyingToId"
          @delete-comment="deleteComment"
          @reply="setReply"
        >
          <template #reply-form>
            <div class="bg-accent/10 p-4 rounded-lg border border-l-4 border-l-primary mb-6 animate-in fade-in slide-in-from-top-2">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-bold">Deine Antwort</span>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="replyingToId = null"
                >
                  Abbrechen
                </Button>
              </div>

              <form @submit.prevent="onSubmit">
                <TipTapEditor
                  :key="`reply-${replyingToId}`"
                  :model-value="values.text"
                  :show-headings="false"
                  :class="{ 'border-destructive': errors.text }"
                  editor-class="p-4 h-32 overflow-auto bg-background focus:outline-none border rounded-md"
                  auto-focus
                  @update:model-value="setFieldValue('text', $event)"
                />
                <p
                  v-if="errors.text"
                  class="text-sm font-medium text-destructive mt-1"
                >
                  {{ errors.text }}
                </p>
                <div class="flex justify-end mt-2">
                  <Button
                    type="submit"
                    size="sm"
                    :disabled="loading"
                  >
                    <Icon
                      v-if="loading"
                      name="lucide:loader-2"
                      class="mr-2 h-4 w-4 animate-spin"
                    />
                    Antwort senden
                  </Button>
                </div>
              </form>
            </div>
          </template>
        </ExperimentCommentDetail>
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
