<script lang="ts" setup>
const route = useRoute()
const experimentSlug = route.params.slug as string
const { data: experiment } = useFetch<ExperimentDetail>(`/api/experiments/${experimentSlug}`)

if (!experiment) {
  showError({ statusCode: 404, statusMessage: "Experiment nicht gefunden" })
}

const attributesWithoutDuration = computed(() => {
  return experiment.value?.attributes.filter(
    attribute => attribute.attribute.name !== "Vorbereitungszeit",
  )
})
const preparationDuration = computed(() => {
  return experiment.value?.attributes.find(
    attribute => attribute.attribute.name === "Vorbereitungszeit",
  )?.value
})

const isImageFile = (mimeType: string) => mimeType.startsWith("image/")
const isVideoFile = (mimeType: string) => mimeType.startsWith("video/")
</script>

<template>
  <div
    v-if="experiment"
    class="grid gap-6 lg:w-2/3 mx-auto"
  >
    <!-- Experiment Name -->
    <div>
      <h1 class="text-4xl font-extrabold">
        {{ experiment.name }}
      </h1>
    </div>

    <!-- Preview Image -->
    <Card
      v-if="experiment.previewImage"
      class="flex justify-center shadow-md max-h-screen"
    >
      <NuxtImg
        :src="experiment.previewImage.path"
        alt="Preview Image"
        class="object-contain"
      />
    </Card>

    <!-- Duration -->
    <div class="flex items-center space-x-3 text-muted-foreground">
      <Icon
        name="heroicons:clock"
        class="w-6 h-6 text-muted-foreground"
      />
      <span class="text-lg font-medium">
        Vorbereitung: {{ preparationDuration || "Unbestimmt" }},
        Durchführung: ca. {{ durationToMinAndHourString(experiment.duration) }}
      </span>
    </div>

    <!-- Attributes Section -->
    <Card class="px-4 py-2 space-y-4 shadow-lg">
      <div
        v-for="attribute in attributesWithoutDuration"
        :key="attribute.id"
        class="flex items-center justify-between border-b pb-2 last:border-none first:pt-2"
      >
        <span class="font-semibold">{{ attribute.attribute.name }}:</span>
        <span class="text-muted-foreground">{{ attribute.value }}</span>
      </div>
    </Card>

    <!-- Sections with Files -->
    <div
      v-if="experiment.sections?.length"
      class="space-y-8"
    >
      <div
        v-for="section in experiment.sections"
        :key="section.id"
        class="space-y-6"
      >
        <h3 class="text-xl font-bold">
          {{ section.experimentSection.name }}
        </h3>
        <p class="text-muted-foreground">
          {{ section.text || "Keine Beschreibung vorhanden" }}
        </p>

        <CarouselWithPreview
          v-if="section.files.length"
          :items="section.files"
          :show-thumbnails="true"
        >
          <!-- Main Carousel Item -->
          <template #item="{ item }">
            <Card class="m-2">
              <CardContent class="relative h-80 flex items-center justify-center p-0">
                <!-- Image File -->
                <template v-if="isImageFile(item.file.mimeType)">
                  <NuxtImg
                    :src="item.file.path"
                    alt="File Preview"
                    class="object-contain w-full h-full rounded"
                  />
                </template>

                <!-- Video File -->
                <template v-else-if="isVideoFile(item.file.mimeType)">
                  <video
                    controls
                    class="object-contain w-full h-full rounded"
                  >
                    <source
                      :src="item.file.path"
                      :type="item.file.mimeType"
                    >
                    Your browser does not support the video tag.
                  </video>
                </template>

                <!-- Other Files -->
                <template v-else>
                  <NuxtLink
                    :to="item.file.path"
                    target="_blank"
                    rel="noopener noreferrer"
                    external
                  >
                    <div class="text-center p-4 text-muted-foreground">
                      <Icon
                        name="heroicons:document"
                        class="w-12 h-12 mx-auto mb-2"
                      />
                      <p>{{ item.file.originalName }}</p>
                    </div>
                  </NuxtLink>
                </template>
              </CardContent>
              <CardFooter
                v-if="item.description"
                class="flex flex-col items-start p-0"
              >
                <Separator />
                <p class="text-center text-muted-foreground m-3">
                  {{ item.description }}
                </p>
              </CardFooter>
            </Card>
          </template>

          <!-- Thumbnail -->
          <template #thumbnail="{ item }">
            <Card class="h-20 w-full flex items-center justify-center rounded">
              <template v-if="isImageFile(item.file.mimeType)">
                <NuxtImg
                  :src="item.file.path"
                  alt="Thumbnail"
                  class="object-contain w-full h-full rounded"
                />
              </template>
              <template v-else-if="isVideoFile(item.file.mimeType)">
                <Icon
                  name="heroicons:film"
                  class="w-8 h-8 text-muted"
                />
              </template>
              <template v-else>
                <Icon
                  name="heroicons:document"
                  class="w-8 h-8 text-muted"
                />
              </template>
            </Card>
          </template>
        </CarouselWithPreview>
      </div>
    </div>
  </div>
</template>
