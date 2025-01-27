<script lang="ts" setup>
import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { useToast } from "@/components/ui/toast/use-toast"

const user = await useUser()

if (!user.value) {
  await navigateTo("/")
}
const emailVerified = user.value?.emailVerified

const loading = ref(false)

const route = useRoute()
const experimentId = route.params.id as string
const { data: experiment } = await useFetch<ExperimentDetail>(`/api/experiments/${experimentId}`)

const { data: sections } = await useFetch("/api/experiments/sections")
const { data: attributes } = await useFetch("/api/experiments/attributes")

const runtimeConfig = useRuntimeConfig()
const previewImageAccepts = ["image/png", "image/jpeg", "image/webp"]
const sectionFileAccepts = runtimeConfig.public.sectionFileAccepts.split(",").map(accept => accept.trim())

const experimentCreateSchema = getExperimentSchema(sections.value ?? [], attributes.value ?? [])
const formSchema = toTypedSchema(experimentCreateSchema)
const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: experiment.value?.name ?? "",
    duration: [experiment.value?.duration ?? 20],
    previewImageId: experiment.value?.previewImage?.id ?? undefined,
    attributes: attributes.value?.map(attribute => ({
      valueId: experiment.value?.attributes.find(a => a.attribute.id === attribute.id)?.id,
    })) ?? [],
    sections: sections.value?.map((section) => {
      const experimentSection = experiment.value?.sections.find(s => s.experimentSection.id === section.id)
      return {
        text: experimentSection?.text ?? "",
        experimentSectionContentId: experimentSection?.id,
        files: experimentSection?.files.map(file => ({
          fileId: file.file.id,
          description: file.description ?? undefined,
        })) ?? [],
      }
    }) ?? [],
  },
})

const { handleFileInput, files } = useFileStorage()
const { toast } = useToast()

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

async function uploadPreviewImage(newFiles: [File]) {
  const oldFileId = form.values.previewImageId
  const fileData = await uploadFile(newFiles)
  if (!fileData[0]) {
    toast({
      title: "Fehler beim Hochladen",
      description: "Es ist ein Fehler beim Hochladen der Datei aufgetreten.",
      variant: "error",
    })
    return
  }
  form.setFieldValue("previewImageId", fileData[0].id)
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

async function uploadSectionFile(sectionIndex: number, newFiles: [File]) {
  const oldFiles = form.values.sections?.[sectionIndex]?.files ?? []
  const fileData = await uploadFile(newFiles)
  if (fileData.length === 0) {
    toast({
      title: "Fehler beim Hochladen",
      description: "Es ist ein Fehler beim Hochladen der Datei aufgetreten.",
      variant: "error",
    })
    return
  }
  form.setFieldValue(`sections.${sectionIndex}.files`, [
    ...(form.values.sections?.[sectionIndex]?.files ?? []),
    ...fileData.map(file => ({
      fileId: file.id,
    })),
  ])
  await onSubmit()

  toast({
    title: `${fileData.length === 1 ? "Datei" : "Dateien"} hochgeladen`,
    description: `Die ${fileData.length === 1 ? "Datei wurde" : "Dateien wurden"} erfolgreich hochgeladen.`,
    variant: "success",
  })

  const oldFileIds = oldFiles
    .map(file => file.fileId)
    .filter(fileId => !form.values.sections?.[sectionIndex]?.files.some(file => file.fileId === fileId))
  deleteFiles(oldFileIds)
}

async function updateFiles(sectionIndex: number, newFileOrder: ExperimentFileList[]) {
  form.setValues({
    ...form.values,
    sections: form.values.sections?.map((section, i) => {
      if (i === sectionIndex) {
        return {
          ...section,
          files: newFileOrder.map(file => ({
            fileId: file.file.id,
            description: file.description ?? undefined,
          })),
        }
      }
      return section
    }),
  })
}

async function removeFile(sectionIndex: number, fileId: string) {
  const file = form.values.sections?.[sectionIndex]?.files?.find(file => file.fileId === fileId)
  form.setValues({
    ...form.values,
    sections: form.values.sections?.map((section, i) => {
      if (i === sectionIndex) {
        return {
          ...section,
          files: section.files.filter(file => file.fileId !== fileId),
        }
      }
      return section
    }),
  })
  await onSubmit()

  if (file) {
    await deleteFiles([file.fileId])
  }
  toast({
    title: "Datei gelöscht",
    description: "Die Datei wurde erfolgreich gelöscht.",
    variant: "success",
  })
}

const onSubmit = form.handleSubmit(async (values) => {
  if (!emailVerified) return
  if (loading.value) return
  loading.value = true

  const response = await $fetch<ExperimentDetail>(`/api/experiments/${experimentId}`, {
    method: "PUT",
    body: values,
  })
  experiment.value = response

  loading.value = false

  toast({
    title: "Experiment gespeichert",
    description: "Das Experiment wurde erfolgreich gespeichert.",
    variant: "success",
  })
})

async function submitForReview() {
  if (!experiment.value || !sections.value || !attributes.value) return

  await onSubmit()
  // Without this timeout, the errors don't show up
  await new Promise(resolve => setTimeout(resolve, 100))

  const experimentForReview = transformExperimentToSchemaType(experiment.value, attributes.value)

  const experimentReviewSchema = getExperimentReadyForReviewSchema(sections.value, attributes.value)
  const errors = await experimentReviewSchema.safeParseAsync(experimentForReview)
  if (!errors.success) {
    const fieldErrors = errors.error.flatten().fieldErrors
    form.setErrors({
      name: fieldErrors.name,
      previewImageId: fieldErrors.previewImageId,
      duration: fieldErrors.duration,
      ...(fieldErrors.attributes?.map((attribute, index) => ({
        [`attributes.${index}.valueId`]: attribute,
      })).reduce((acc, curr) => ({ ...acc, ...curr }), {})),
      ...(fieldErrors.sections?.map((section, index) => ({
        [`sections.${index}.text`]: section,
      })).reduce((acc, curr) => ({ ...acc, ...curr }), {})),
    })
    toast({
      title: "Fehler beim Überprüfen",
      description: "Es sind noch nicht alle erforderlichen Felder ausgefüllt.",
      variant: "error",
    })
    return
  }

  await $fetch<ExperimentDetail>(`/api/experiments/submit/${experimentId}`, {
    method: "POST",
  })

  toast({
    title: "Experiment zur Überprüfung eingereicht",
    description: "Das Experiment wurde zur Überprüfung eingereicht.",
    variant: "success",
  })
}
</script>

<template>
  <div>
    <div class="text-4xl font-bold mb-8">
      Experiment bearbeiten
    </div>
    <div v-if="!emailVerified">
      Bitte bestätige deine E-Mail-Adresse, um ein Experiment zu erstellen.
    </div>
    <div v-else>
      <form
        class="grid gap-4 lg:w-2/3"
        @submit="onSubmit"
      >
        <h3 class="text-xl font-semibold mt-2">
          Allgemeines
        </h3>

        <FormField
          v-slot="{ componentField }"
          name="name"
        >
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input
                id="name"
                v-bind="componentField"
                type="text"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          name="previewImageId"
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
                  v-if="form.values.previewImageId"
                  #message
                >
                  <NuxtImg
                    :src="experiment!.previewImage!.path"
                    alt="Vorschaubild"
                    class="max-h-80 object-contain"
                  />
                </template>
              </Dropfile>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <h3 class="text-xl font-semibold mt-2">
          Kategorisierung
        </h3>

        <FormField
          v-slot="{ componentField, value }"
          name="duration"
        >
          <FormItem>
            <FormLabel>Dauer</FormLabel>
            <FormControl>
              <Slider
                id="duration"
                v-bind="componentField"
                :default-value="[20]"
                :min="5"
                :max="120"
                :step="5"
              />
              <FormDescription class="flex justify-between">
                <span>Wie lange dauert die Durchführung des Experiments ungefähr?</span>
                <span>ca. {{ durationToMinAndHourString(value?.[0]) }}</span>
              </FormDescription>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <template
          v-for="(attribute, index) in attributes"
          :key="attribute.id"
        >
          <FormField
            v-slot="{ componentField }"
            :name="`attributes[${index}].valueId`"
          >
            <FormItem>
              <FormLabel>{{ attribute.name }}</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Auswählen" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <template
                      v-for="value in attribute.values"
                      :key="value.id"
                    >
                      <SelectItem :value="value.id">
                        {{ value.value }}
                      </SelectItem>
                    </template>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>
        </template>

        <template
          v-for="section in sections"
          :key="section.id"
        >
          <h3 class="text-xl font-semibold mt-2">
            {{ section.name }}
          </h3>

          <FormField
            v-slot="{ componentField }"
            :name="`sections[${section.order}].text`"
          >
            <FormItem>
              <FormLabel>Beschreibung</FormLabel>
              <FormControl>
                <Textarea
                  :id="`sections[${section.order}].text`"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <Label>Dateien</Label>
          <Dropfile
            :title="`Dateien für ${section.name}`"
            :subtext="`Ziehe Dateien hierher oder klicke, um Dateien hochzuladen.`"
            icon="heroicons:cloud-arrow-up"
            :accept="sectionFileAccepts"
            @dropped="event => uploadSectionFile(section.order, event)"
          />
          <DraggableList
            :values="experiment?.sections[section.order]?.files ?? []"
            group="experiment-group"
            @update:values="newFileOrder => updateFiles(section.order, newFileOrder)"
          >
            <template #item="{ item, index }">
              <Card
                class="flex items-center"
              >
                <NuxtImg
                  v-if="item.file.mimeType.startsWith('image')"
                  :src="item.file.path"
                  :alt="item.description ?? 'Datei'"
                  class="max-h-24 w-40 object-contain"
                />
                <Separator
                  v-if="item.file.mimeType.startsWith('image')"
                  orientation="vertical"
                />
                <div class="flex flex-col flex-1 md:flex-row items-center">
                  <FormField
                    v-slot="{ componentField }"
                    :name="`sections[${section.order}].files[${index}].description`"
                  >
                    <FormItem class="flex-1 p-4 w-full">
                      <FormLabel>
                        <NuxtLink
                          :to="item.file.path"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="hover:underline"
                          external
                        >
                          {{ item.file.originalName }}
                          <Icon
                            name="heroicons:arrow-top-right-on-square"
                          />
                        </NuxtLink>
                      </FormLabel>
                      <FormControl>
                        <Input
                          v-bind="componentField"
                          type="text"
                          placeholder="Beschreibung"
                        />
                      </FormControl>
                    </FormItem>
                  </FormField>
                  <div class="m-2">
                    <Icon
                      name="heroicons:bars-3"
                      class="hover:cursor-grab"
                    />

                    <Button
                      variant="ghost"
                      @click="removeFile(section.order, item.file.id)"
                    >
                      <Icon
                        name="heroicons:trash"
                        class="text-destructive"
                      />
                    </Button>
                  </div>
                </div>
              </Card>
            </template>
            <template #empty-list>
              <Card class="text-center py-6">
                <div class="flex flex-col items-center justify-center">
                  <Icon
                    name="heroicons:plus-circle"
                    class="h-12 w-12 text-muted-foreground/60"
                  />
                  <p class="mt-4 mx-4 text-sm text-muted-foreground/60">
                    Noch keine Dateien für {{ section.name }} vorhanden.
                  </p>
                </div>
              </Card>
            </template>
          </DraggableList>
        </template>

        <Button
          type="submit"
          @click="console.log(form.errors.value)"
        >
          Speichern
        </Button>
        <Button
          variant="secondary"
          @click.prevent
          @click="navigateTo(`/experiments/${experimentId}`)"
        >
          Vorschau anzeigen
        </Button>
        <Button
          variant="secondary"
          @click.prevent
          @click="submitForReview"
        >
          Veröffentlichen
        </Button>
      </form>
    </div>
  </div>
</template>
