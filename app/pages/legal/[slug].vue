<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"

definePageMeta({
  validate: ({ params }) => {
    return params.slug === "imprint" || params.slug === "privacy-policy" || params.slug === "terms-of-service"
  },
})
authorize(legalAbilities.get)
const loading = ref(false)
const open = ref(false)
const formSchema = toTypedSchema(legalDocumentUpdateSchema)

const route = useRoute()
const slug = route.params.slug as string

const { data: legal } = await useFetch(`/api/legal/${slug}`)
const form = useForm({ validationSchema: formSchema, initialValues: {
  name: legal.value?.name,
  text: legal.value?.text,
} })
const openForm = (event: boolean) => {
  open.value = event
  if (event) {
    form.resetForm({
      values: {
        name: legal.value?.name,
        text: legal.value?.text,
      },
    })
  }
}

watch (() => legal.value, (newLegal) => {
  if (!open.value) {
    form.setValues({
      name: newLegal?.name,
      text: newLegal?.text,
    })
  }
})

const onSubmit = form.handleSubmit(async (values) => {
  if (loading.value) return
  loading.value = true

  legal.value = await $fetch<LegalDocumentDetail>(`/api/legal/${slug}`, {
    method: "PUT",
    body: values,
  })
  open.value = false
  loading.value = false
})
</script>

<template>
  <div>
    <div class="prose dark:prose-invert max-w-full">
      <h1>
        {{ legal!.name }}
      </h1>
      <div v-html="legal!.text" />
    </div>
    <AuthCan
      :ability="legalAbilities.put"
      :param="[]"
    >
      <Dialog
        :open="open"
        @update:open="openForm"
      >
        <DialogTrigger as-child>
          <Button
            variant="outline"
            class="m-1 px-5 justify-center"
            @click="open=true"
          >
            Bearbeiten
          </Button>
        </DialogTrigger>
        <DialogContent class="max-w-[800px] max-h-full overflow-auto">
          <DialogHeader>
            <DialogTitle>
              Ändern des Dokuments
            </DialogTitle>
            <DialogDescription>
              Hier können Sie das Dokument bearbeiten.
            </DialogDescription>
          </DialogHeader>
          <form
            class="grid gap-4"
            @submit="onSubmit"
          >
            <FormField
              v-slot="{ componentField }"
              name="name"
            >
              <FormItem>
                <FormLabel>Titel</FormLabel>
                <FormControl>
                  <Input
                    id="name"
                    :default-value="legal?.name"
                    v-bind="componentField"
                    type="text"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField
              v-slot="{ componentField }"
              name="text"
            >
              <FormItem>
                <FormLabel>Inhalt</FormLabel>
                <FormControl>
                  <TipTapEditor
                    id="text"
                    :default-value="legal?.text"
                    v-bind="componentField"
                    :show-headings="true"
                    @click.prevent
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </form>
          <DialogFooter>
            <Button
              type="submit"
              @click="onSubmit"
            >
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthCan>
  </div>
</template>
