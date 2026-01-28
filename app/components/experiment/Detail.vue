<script lang="ts" setup>
const user = await useUser()

const { experiment } = defineProps<{
  experiment?: ExperimentDetail
  preview?: boolean
  reviewStarted?: boolean
}>()

const reviews = ref<Array<{
  id: string
  status: string
  createdAt: string
  updatedAt: string
  reviewer: { name: string, image: string | null }
  sectionsCritiques: Array<{
    id: string
    critique: string
    sectionContent: {
      id: string
      experimentSection: { id: string, name: string }
    }
  }>
}>>([])

const canReviewExperiments = await allows(experimentAbilities.review)

watch(
  () => experiment?.id,
  async (id) => {
    if (!id || !experiment || !canReviewExperiments) return

    const reviewExperimentId = experiment.revisionOf?.id ?? id
    const { data, error } = await useFetch(`/api/experiments/review/by-experiment?experimentId=${reviewExperimentId}`)

    if (!error.value) {
      reviews.value = data.value ?? []
    }
  },
  { immediate: true },
)

const comments = defineModel<Record<string, string>>("comments", {
  default: {},
})

const attributesWithoutDuration = computed(() => {
  return experiment?.attributes.filter(
    attribute => attribute.name.replace("\u00AD", "") !== "Vorbereitungszeit",
  )
})
const preparationDuration = computed(() => {
  return experiment?.attributes.find(
    attribute => attribute.name.replace("\u00AD", "") === "Vorbereitungszeit",
  )?.values[0]?.value
})

function attributeValuesString(attribute: ExperimentAttributeDetail) {
  return attribute.values.map(value => value.value).join(", ")
}

const isImageFile = (mimeType: string) => mimeType.startsWith("image/")
const isVideoFile = (mimeType: string) => mimeType.startsWith("video/")

const router = useRouter()
const canGoBack = ref(false)

onMounted(() => {
  canGoBack.value = window.history.length > 1
})

const showDeleteDialog = ref(false)
const sectionImageStartIndices = computed(() => {
  if (!experiment?.sections) return []

  let count = 0
  return experiment.sections.map((section) => {
    const startIndex = count
    count += section.files.length
    return startIndex
  })
})

function getImageTitle(sectionIndex: number, fileIndex: number) {
  const globalIndex = (sectionImageStartIndices.value[sectionIndex] ?? 0) + fileIndex
  return `Abb. ${globalIndex + 1}`
}

function getReviewsForSection(sectionId: string) {
  return reviews.value
    .filter(review => review.sectionsCritiques.some(c => c.sectionContent.experimentSection.id === sectionId))
    .map(review => ({
      ...review,
      critiques: review.sectionsCritiques.filter(c => c.sectionContent.experimentSection.id === sectionId),
    }))
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
</script>

<template>
  <div
    v-if="experiment"
    class="grid gap-6 lg:w-2/3 mx-auto"
  >
    <Button
      variant="outline"
      :disabled="!canGoBack"
      @click="router.back"
    >
      <Icon
        name="heroicons:arrow-left"
        class="w-4 h-4 mr-2"
      />
      Zurück
    </Button>
    <!-- Experiment Name -->
    <div class="flex items-center">
      <h1 class="text-4xl font-extrabold mr-2">
        {{ experiment.name }}
      </h1>
      <DropdownMenu
        v-if="user"
      >
        <DropdownMenuTrigger as-child>
          <Button
            variant="outline"
            size="sm"
            class="rounded-full p-1"
          >
            <Icon
              name="heroicons:ellipsis-horizontal"
              class="w-6 h-6 text-muted-foreground"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            v-if="user !== null && (user.role === 'ADMIN')"
            @click="navigateTo(`/users?search=${experiment.userId}`)"
          >
            <span>
              Zur Ersteller:in
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            @click="duplicateExperiment(experiment, false)"
          >
            <span>
              Kopie erstellen
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            v-if="user.id === experiment.userId && !experiment.revisedBy && (experiment.status === 'IN_REVIEW' || experiment.status === 'PUBLISHED')"
            :disabled="experiment.status === 'IN_REVIEW'"
            :class="{ 'opacity-50': experiment.status === 'IN_REVIEW' }"
            @click="duplicateExperiment(experiment, true)"
            @click.prevent
          >
            <span>
              Überarbeiten
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            v-if="user.id === experiment.userId && experiment.revisedBy"
            @click="navigateTo(`/experiments/edit/${experiment.revisedBy.id}`)"
          >
            <span>
              Zur Überarbeitung
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            v-else-if="user.id === experiment.userId && experiment.status === 'DRAFT' || experiment.status === 'REJECTED'"
          >
            <NuxtLink
              :to="`/experiments/edit/${experiment.id}`"
              class="no-underline w-full block"
            >
              Bearbeiten
            </NuxtLink>
          </DropdownMenuItem>
          <DropdownMenuItem
            v-if="user !== null && (user.id === experiment.userId || user.role === 'ADMIN')"
            class="text-destructive"
            @click="showDeleteDialog = true"
          >
            <span>
              Löschen
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDeleteAlertDialogBool
        v-model="showDeleteDialog"
        :on-delete="() => deleteExperiment(experiment.id).then(async () => await navigateTo('/experiments'))"
        header="Versuch löschen?"
      />
    </div>

    <!-- Rating -->
    <ExperimentRating
      :experiment="experiment"
    />

    <!-- Preview Image -->
    <Card
      v-if="experiment.previewImage"
      class="flex justify-center shadow-md max-h-200"
    >
      <NuxtPicture
        format="webp,avif"
        sizes="100vw md:850px"
        :src="experiment.previewImage.path"
        alt="Preview Image"
        fit="inside"
      />
    </Card>

    <!-- Duration -->
    <div class="flex items-center space-x-3 text-muted-foreground">
      <Icon
        name="heroicons:clock"
        class="w-6 h-6 text-muted-foreground"
      />
      <span class="text-lg font-medium">
        {{ preparationDuration ? `Vorbereitung:  ${preparationDuration || "Unbestimmt"}, ` : "" }}
        Durchführung: ca. {{ durationToMinAndHourString(experiment.duration) }}
      </span>
    </div>

    <!-- Attributes Section -->
    <Card class="px-4 py-2 space-y-4 shadow-lg">
      <div v-if="experiment.attributes.length">
        <div
          v-for="attribute in attributesWithoutDuration"
          :key="attribute.id"
          class="flex items-center justify-between border-b py-2 last:border-none"
        >
          <span class="font-semibold">{{ attribute.name }}:</span>
          <span class="text-muted-foreground">{{ attributeValuesString(attribute) }}</span>
        </div>
      </div>
      <div
        v-else
        class="text-muted-foreground"
      >
        Attribute noch nicht gesetzt
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
        <h2 class="text-3xl font-bold">
          {{ section.experimentSection.name }}
        </h2>
        <LatexContent
          v-if="section.text && section.text.length && section.text != '<p></p>'"
          :content="section.text"
        />
        <p
          v-else
          class="text-muted-foreground"
        >
          Keine Beschreibung vorhanden
        </p>

        <CarouselWithPreview
          v-if="section.files.length"
          :items="section.files"
          :show-thumbnails="true"
        >
          <!-- Main Carousel Item -->
          <template #item="{ item, index }">
            <Card>
              <CardContent class="h-80 flex items-center justify-center p-0">
                <!-- Image File -->
                <template v-if="isImageFile(item.file.mimeType)">
                  <NuxtPicture
                    format="webp,avif"
                    sizes="100vw md:850px"
                    fit="inside"
                    :src="item.file.path"
                    alt="File Preview"
                    :img-attrs="{ class: 'object-contain w-full h-full rounded' }"
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
              <Separator class="mb-3" />
              <p
                v-if="isImageFile(item.file.mimeType)"
                class="w-full whitespace-normal text-center font-semibold pt-2"
              >
                {{ getImageTitle(experiment.sections.indexOf(section), index) }}
              </p>
              <p
                class="w-full whitespace-normal text-center text-muted-foreground pb-3"
                style="overflow-wrap: anywhere;"
              >
                {{ item.description }}
              </p>
            </Card>
          </template>

          <!-- Thumbnail -->
          <template #thumbnail="{ item }">
            <Card class="h-20 w-full flex items-center justify-center rounded">
              <template v-if="isImageFile(item.file.mimeType)">
                <NuxtPicture
                  format="webp,avif"
                  height="100"
                  fit="inside"
                  :src="item.file.path"
                  alt="Thumbnail"
                  :img-attrs="{ class: 'object-contain w-full h-full' }"
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

        <div
          v-if="canReviewExperiments && getReviewsForSection(section.experimentSection.id).length > 0"
          class="mt-6 space-y-4"
        >
          <h3 class="text-lg font-semibold flex items-center gap-2">
            <Icon
              name="heroicons:chat-bubble-left-right"
              class="w-5 h-5"
            />
            Bisherige Beanstandungen
          </h3>

          <div
            v-for="review in getReviewsForSection(section.experimentSection.id)"
            :key="review.id"
            class="space-y-2"
          >
            <div
              v-for="critique in review.critiques"
              :key="critique.id"
              class="border rounded-lg p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 shadow-sm"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <Icon
                    name="heroicons:user-circle"
                    class="w-5 h-5 text-amber-600"
                  />
                  <span class="text-sm font-semibold text-amber-700 dark:text-amber-400">
                    {{ review.reviewer?.name || 'Reviewer' }}
                  </span>
                </div>
                <span class="text-xs text-muted-foreground">
                  {{ formatDate(review.updatedAt) }}
                </span>
              </div>
              <div
                class="prose prose-sm dark:prose-invert"
                v-html="critique.critique"
              />
            </div>
          </div>
        </div>

        <!-- Textfeld für Review-Modul -->
        <div
          v-if="reviewStarted"
          class="mt-6"
        >
          <label class="block text-2xl font-extrabold mb-3">
            Beanstandung:
          </label>

          <TipTapEditor
            :model-value="comments[section.id] ?? ''"
            :show-headings="false"
            editor-class="p-4 min-h-[160px] resize-y overflow-auto border rounded"
            @update:model-value="val => comments[section.id] = val"
          />

          <p class="text-sm text-muted-foreground mt-2">
            Optional: Hinweise oder Beanstandungen für diesen Abschnitt
          </p>
        </div>
      </div>
    </div>

    <!-- Own rating -->
    <Separator />
    <ExperimentRatingOwn
      v-if="user"
      :experiment="experiment"
    />
    <ExperimentComment
      :experiment="experiment"
    />
  </div>
</template>
