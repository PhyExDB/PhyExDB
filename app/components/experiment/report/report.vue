<script lang="ts" setup>
import { ref, computed } from "vue"
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~~/app/components/ui/dialog"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "~~/app/components/ui/form"
import { Textarea } from "~~/app/components/ui/textarea"
import { Button } from "~~/app/components/ui/button"
import { experimentReportSchema } from "~~/server/schemas/experimentReportSchema"
import { useRoute } from "vue-router"

// ---------- Props ----------
const props = defineProps<{
  userRole?: string,  // Rolle des aktuellen Users: "USER", "MODERATOR", "ADMIN"
}>()

const route = useRoute()
const loading = ref(false)
const open = ref(false)
const success = ref("")
const error = ref("")


// ---------- Form setup ----------
const formSchema = toTypedSchema(experimentReportSchema)
const form = useForm({
  validationSchema: formSchema,
  initialValues: { message: "" },
})

// ---------- Submit ----------
async function onSubmit(values: { message: string }) {
  if (loading.value) return
  loading.value = true
  error.value = ""
  success.value = ""

  try {
    await $fetch(`/api/experiments/${route.params.slug}/save.post.ts`, {
      method: "POST",
      body: values,
    })
    success.value = "Report erfolgreich gesendet!"
    form.resetForm()
    open.value = false
  } catch (err: any) {
    console.error(err)
    error.value = err?.data?.message || "Fehler beim Senden"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <Dialog :open="open" @update:open="open = $event">
      <!-- Trigger Button -->
      <DialogTrigger as-child>
        <Button
            class="btn-report"
            variant="outline"
            >Experiment melden
        </Button>
      </DialogTrigger>

      <DialogContent class="bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle>Versuch melden</DialogTitle>
          <DialogDescription>
            Melde den Versuch und gib einen Grund an.
          </DialogDescription>
        </DialogHeader>

        <form class="grid gap-4" @submit.prevent="form.handleSubmit(onSubmit)">
          <FormField v-slot="{ componentField }" name="message">
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
              <FormMessage />
            </FormItem>
          </FormField>

          <p v-if="error" class="text-red-500">{{ error }}</p>
          <p v-if="success" class="text-green-500">{{ success }}</p>

          <DialogFooter class="flex flex-col sm:flex-row gap-2 mt-2">
            <Button
                type="button"

                @click="open = false"
              >Abbrechen
            </Button>
            <Button
                type="submit"
                variant="destructive"
                @click="onSubmit"
              >Melden
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>

.btn-report {
  background-color: transparent;
  color: red;
  font-weight: 600;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  border: 1px solid red;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}
.btn-report:hover {
  background-color: white;
  color: red;
}
</style>


