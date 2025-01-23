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
    sections: experiment.value?.sections.map(section => ({
      text: section.text,
      experimentSectionContentId: section.id,
      files: section.files.map(file => ({
        fileId: file.id,
        description: file.description ?? "",
      })),
    })) ?? [],
  },
})

function minutesToMinAndHourString(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours > 0 ? `${hours} h ` : ""}${remainingMinutes > 0 ? `${remainingMinutes} min` : ""}`
}

const { handleFileInput, files } = useFileStorage()
const { toast } = useToast()

async function uploadFile(newFiles: [File]) {
  const oldFileId = form.values.previewImageId
  await handleFileInput({ target: { files: newFiles } })
  const fileData = await $fetch("/api/files", {
    method: "POST",
    body: {
      files: files.value,
    },
  })
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
    $fetch(`/api/files/${oldFileId}`, {
      method: "DELETE",
    })
  }
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
})
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

        <Label>Vorschaubild</Label>
        <Dropfile
          title="Vorschaubild"
          :subtext="`Ziehe ein Bild hierher oder klicke, um ein Bild hochzuladen.`"
          icon="heroicons:cloud-arrow-up"
          :accept="previewImageAccepts"
          :multiple="false"
          @dropped="uploadFile"
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
                <span>ca. {{ minutesToMinAndHourString(value?.[0]) }}</span>
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
            @dropped="console.log"
          />
        </template>
        <Button
          type="submit"
        >
          Speichern
        </Button>
      </form>
    </div>
  </div>
</template>

<style>

</style>
