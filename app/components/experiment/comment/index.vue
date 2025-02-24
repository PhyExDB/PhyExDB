<script lang="ts" setup>
import { ExperimentCommentDetail } from "#components";
import { toTypedSchema } from "@vee-validate/zod"
import { enableCompileCache } from "module";
import { useForm } from "vee-validate"

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

const canComment = data.value && await allows(experimentCommentAbilities.post, { ...props.experiment, commentsEnabled: true })
const canEnable = await allows(experimentCommentAbilities.enable, props.experiment)

async function deleteComment(commentId: string) {
  await useFetch(`/api/experiments/${id.value}/comments/${commentId}`, {
    method: "DELETE",
  })
  if(data.value?.items.length === 1 && page.value > 1) {
    page.value = page.value - 1
  }
  await refresh()
}

const formSchema = toTypedSchema(experimentCommentCreateSchema)
const form = useForm({ validationSchema: formSchema })
const loading = ref(false)

const onSubmit = form.handleSubmit(async (values) => {
  if (loading.value) return
  loading.value = true
  
  await $fetch(`/api/experiments/${id.value}/comments`, {
    method: "POST",
    body: values,
  })
  form.resetForm()
  page.value = 1
  await refresh()

  loading.value = false
})

async function enableComments(enable: boolean){
  await $fetch(`/api/experiments/${id.value}/comments/enable`, {
    method: "PUT",
    body: { enable },
  })
  refresh()
}

</script>

<template>
  <div
    v-if="data"
  >
    <div
      v-if="canComment"
    >
      <form
        class="flex flex-col sm:flex-row gap-4"
        @submit="onSubmit"
      >
        <FormField
          v-slot="{ componentField }"
          name="text"
        >
          <FormItem class="w-full">
            <FormControl>
              <Input
                id="text"
                default-value=""
                v-bind="componentField"
                type="text"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <Button
          variant="outline"
          type="submit"
          @click="onSubmit"
        >
          Kommentieren
        </Button>
      </form>
    </div>

    <div>
      <h1 class="text-4xl font-extrabold mr-2 pb-4 mt-6">
        Kommentare
      </h1>
      <Button
        v-if="canEnable"
        variant="outline"
        @click="enableComments(false)"
      >
        Kommentare für diesen Versuch verbieten
      </Button>
      <div
        v-for="comment in data?.items"
      >
        <ExperimentCommentDetail
          :experiment="experiment"
          :comment="comment"
          @deleteComment="deleteComment"
        />
      </div>

      <div
        v-if="data?.pagination.total === 0"
      >
        Bisher gibt es keine Kommentare.
      </div>

      <MyPagination
        v-model="page"
        :page-meta="data?.pagination"
      />
    </div>
  </div>
  <div
    v-else
    class="flex flex-col"
  >
    Für diesen Versuch sind Kommentare deaktiviert.

    <Button
      v-if="canEnable"
      @click="enableComments(true)"
      class="self-start m-2"
    >
      Kommentare für diesen Versuch erlauben
    </Button>
  </div>
</template>
