<script lang="ts" setup>
import { ref } from "vue"
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~~/app/components/ui/dialog"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "~~/app/components/ui/form"
import { Textarea } from "~~/app/components/ui/textarea"
import { Button } from "~~/app/components/ui/button"
import { experimentReportSchema } from "~~/server/schemas/experimentReportSchema"
import { useToast } from "@/components/ui/toast/use-toast"

const { toast } = useToast()
const loading = ref(false)
const open = ref(false)
const serverError = ref("")
const route = useRoute()
const formSchema = toTypedSchema(experimentReportSchema)
const form = useForm({
  validationSchema: formSchema,
  initialValues: { message: "" },
})

const onSubmit = form.handleSubmit(async (values) => {
  loading.value = true
  serverError.value = ""

  const identifier = route.params.slug

  try {
    await $fetch(`/api/experiments/reports/${identifier}`, {
      method: "POST",
      body: { message: values.message },
    })

    form.resetForm()
    open.value = false

    toast({
      title: "Report",
      description: "Report erfolgreich gesendet! Vielen Dank!",
      variant: "success",
    })
  } catch (err: any) {
    console.error(err)
    serverError.value = err?.data?.statusMessage || "Fehler beim Senden"
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <Dialog
    :open="open"
    @update:open="open = $event"
  >
    <DialogTrigger as-child>
      <Button
        variant="outline"
        class="border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
      >
        Experiment melden
      </Button>
    </DialogTrigger>

    <DialogContent class="bg-gray-900 text-white">
      <DialogHeader>
        <DialogTitle>Versuch melden</DialogTitle>
        <DialogDescription class="text-gray-400">
          Melde den Versuch und gib einen Grund an.
        </DialogDescription>
      </DialogHeader>

      <form
        class="grid gap-4"
        @submit.prevent="onSubmit"
      >
        <FormField
          v-slot="{ componentField }"
          name="message"
        >
          <FormItem>
            <FormLabel>Begründung</FormLabel>
            <FormControl>
              <Textarea
                v-bind="componentField"
                placeholder="Schreibe hier deine Meldung..."
                class="bg-gray-900 text-white border-gray-700"
                rows="5"
              />
            </FormControl>
            <FormMessage class="text-red-400" />
          </FormItem>
        </FormField>

        <p
          v-if="serverError"
          class="text-sm text-red-500 font-medium text-center"
        >
          {{ serverError }}
        </p>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            :disabled="loading"
            @click="open = false"
          >
            Abbrechen
          </Button>

          <Button
            type="submit"
            variant="destructive"
            :disabled="loading"
          >
            <span>Melden</span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
