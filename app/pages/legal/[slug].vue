<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { allows } from "~/utils/authorization"
import type { LegalDocumentDetail } from "~~/shared/types"

definePageMeta({
  validate: ({ params }) => {
    return params.slug === "imprint" || params.slug === "privacy-policy" || params.slug === "terms-of-service"
  },
})
const allowed = await allows(legalAbilities.put)

const loading = ref(false)
const open = ref(false)
const formSchema = toTypedSchema(legalDocumentUpdateSchema)
const form = useForm({ validationSchema: formSchema })

const route = useRoute()
const slug = route.params.slug as string

const { data: legal } = await useAPI<LegalDocumentDetail>(`/api/legal/${slug}`)

const onSubmit = form.handleSubmit(async (values) => {
  if (loading.value) return
  legal.value = await $fetch(`/api/legal/${slug}`, {
    method: "PUT",
    body: values,
  })
  open.value = false
})
</script>

<template>
  <div>
    <div class="prose dark:prose-invert">
      <h1>
        {{ legal!.name }}
      </h1>
      <p>{{ legal!.text }}</p>
    </div>
    <div v-if="allowed">
      <Dialog
        :open="open"
        @update:open="open=$eve"
      >
        <DialogTrigger as-child>
          <Button
            variant="outline"
            class="m-1 px-5 justify-center"
            @click="open=true"
          >
            edit
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Ändern des Dokuments
            </DialogTitle>
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
                <FormLabel>Text</FormLabel>
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
                <FormLabel>Text</FormLabel>
                <FormControl>
                  <Input
                    id="text"
                    :default-value="legal?.text"
                    v-bind="componentField"
                    type="text"
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
    </div>
  </div>
</template>
