<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { useToast } from "@/components/ui/toast/use-toast"

const canEdit = await allows(startpageAbilities.put)

const loading = ref(false)
const open = ref(false)
const formSchema = toTypedSchema(startpageSchema)

const previewImageAccepts = ["image/png", "image/jpeg", "image/webp"]

const { data: startpage } = await useFetch(`/api/startpage`)
const form = useForm({ validationSchema: formSchema, initialValues: {
  text: startpage.value?.text,
  description: startpage.value?.description,
  files: startpage.value?.files.map(file => file.id),
} })

const openForm = (event: boolean) => {
  open.value = event
  if (event) {
    form.resetForm({
      values: {
        text: startpage.value?.text,
        description: startpage.value?.description,
        files: startpage.value?.files.map(file => file.id),
      },
    })
  }
}

watch (() => startpage.value, (newStartpage) => {
  if (!open.value) {
    form.setValues({
      text: newStartpage?.text,
      description: newStartpage?.description,
      files: newStartpage?.files.map(file => file.id),
    })
  }
})

const { handleFileInput, files } = useFileStorage()

async function uploadFile(newFiles: [File]) {
  await handleFileInput({ target: { files: newFiles } })
  return await $fetch("/api/files", {
    method: "POST",
    body: {
      files: files.value,
    },
  })
}

async function deleteFiles(fileIds: string[]) {
  return await Promise.all(fileIds.map(async (fileId) => {
    await $fetch(`/api/files/${fileId}`, {
      method: "DELETE",
    })
  }))
}

const { toast } = useToast()
async function uploadPreviewImage(newFiles: [File]) {
  const oldFileId = form.values.files?.[0]
  const fileData = await uploadFile(newFiles)
  if (!fileData[0]) {
    toast({
      title: "Fehler beim Hochladen",
      description: "Es ist ein Fehler beim Hochladen der Datei aufgetreten.",
      variant: "error",
    })
    return
  }
  form.setFieldValue("files.0", fileData[0].id)
  await onSubmit()

  toast({
    title: "Datei hochgeladen",
    description: "Die Datei wurde erfolgreich hochgeladen.",
    variant: "success",
  })

  if (oldFileId) {
    deleteFiles([oldFileId])
  }
}

const onSubmit = form.handleSubmit(async (values) => {
  if (loading.value) return
  loading.value = true

  startpage.value = await $fetch<Startpage>(`/api/startpage`, {
    method: "PUT",
    body: values,
  })
  open.value = false
  loading.value = false
})
</script>

<template>
  <div>
    <NuxtImg
      src="/experiment_placeholder.png"
      alt="Background Image"
      class="absolute top-[65px] left-0 w-full h-96 object-cover"
    />
    <div class="h-96" />
    <div class="py-8 text-center">
      <h3 class="mb-4 text-3xl font-semibold md:mb-5 md:text-4xl">
        <span class="font-bold">PhyEx</span><span class="text-accent">DB</span>
      </h3>
      <p class="text-lg text-muted-foreground md:text-xl">
        {{ startpage?.description }}
      </p>
      <div class="mt-8 flex w-full flex-col-reverse justify-center gap-3 md:w-auto md:flex-row">
        <NuxtLink to="/experiments">
          <Button
            size="lg"
            class="w-full md:w-48"
            variant="outline"
          >
            Versuche durchsuchen
          </Button>
        </NuxtLink>
        <NuxtLink to="/experiments/mine">
          <Button
            size="lg"
            class="w-full md:w-48"
          >
            Versuch erstellen
          </Button>
        </NuxtLink>
      </div>
    </div>
    <div class="py-8 text-center">
      <h4 class="mb-4 text-2xl font-semibold md:mb-5 md:text-3xl">
        Über diese Webseite
      </h4>
      <p
        class="text-lg md:text-xl"
        v-html="startpage?.text"
      />
    </div>
    <div
      v-if="canEdit"
      class="py-8 text-center"
    >
      <Dialog
        :open="open"
        @update:open="openForm"
      >
        <DialogTrigger as-child>
          <Button
            size="lg"
            class="w-full md:w-48"
          >
            Startseite Bearbeiten
          </Button>
        </DialogTrigger>
        <DialogContent class="max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              Ändern des Dokuments
            </DialogTitle>
            <DialogDescription>
              Hier können Sie die Startseite bearbeiten.
            </DialogDescription>
          </DialogHeader>
          <form
            class="grid gap-4"
            @submit="onSubmit"
          >
            <FormField
              v-slot="{ componentField }"
              name="description"
            >
              <FormItem>
                <FormLabel>Beschreibung</FormLabel>
                <FormControl>
                  <Input
                    id="description"
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
                    v-bind="componentField"
                    :show-headings="true"
                    @click.prevent
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField
              name="files[0]"
            >
              <FormItem>
                <FormLabel>Vorschaubild</FormLabel>
                <FormControl>
                  <Dropfile
                    title="Vorschaubild"
                    :subtext="`Ziehe ein Bild hierher oder klicke, um ein Bild hochzuladen.`"
                    icon="heroicons:cloud-arrow-up"
                    :accept="previewImageAccepts"
                    :multiple="false"
                    @dropped="uploadPreviewImage"
                  >
                    <template
                      v-if="startpage?.files[0]?.path"
                      #message
                    >
                      <NuxtImg
                        :src="startpage!.files[0]!.path"
                        alt="Vorschaubild"
                        class="max-h-80 object-contain"
                      />
                    </template>
                  </Dropfile>
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
