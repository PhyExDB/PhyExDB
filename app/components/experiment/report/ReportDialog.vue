<script lang="ts" setup>
import { TriangleAlert } from "lucide-vue-next"
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { reportSchema } from "~~/shared/schemas/report.schema"
import { useToast } from "@/components/ui/toast/use-toast"

const { toast } = useToast()
const loading = ref(false)
const open = ref(false)
const serverError = ref("")
const route = useRoute()
const user = await useUser()

const formSchema = toTypedSchema(reportSchema)
const form = useForm({
  validationSchema: formSchema,
  initialValues: { message: "" },
})

const onSubmit = form.handleSubmit(async (values) => {
  loading.value = true
  serverError.value = ""

  try {
    await $fetch(`/api/experiments/reports/${route.params.slug}`, {
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
  } catch {
    serverError.value = "Fehler beim Senden"
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
    <DialogTrigger
      v-if="user"
      as-child
    >
      <Button
        variant="outline"
        class="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
      >
        <TriangleAlert />
        Experiment melden
      </Button>
    </DialogTrigger>

    <DialogContent>
      <DialogHeader>
        <DialogTitle>Versuch melden</DialogTitle>
        <DialogDescription class="text-muted-foreground">
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
                rows="5"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <p
          v-if="serverError"
          class="text-sm text-destructive font-medium text-center"
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
            Melden
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
