<script lang="ts" setup>
import type { LightboxSection } from "~/components/ui/carousel/interface"

const user = await useUser()

const { experiment } = defineProps<{
  experiment?: ExperimentDetail
  preview?: boolean
}>()

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

const activeLightboxIndex = ref<number | null>(null)
const activeSectionForLightbox = ref<LightboxSection | null>(null)

function openLightbox(section: LightboxSection, index: number) {
  activeSectionForLightbox.value = section
  activeLightboxIndex.value = index
  document.body.style.overflow = "hidden"
}

function openPreviewLightbox() {
  if (!experiment?.previewImage) return
  activeSectionForLightbox.value = { files: [{ file: experiment.previewImage, description: "" }] }
  activeLightboxIndex.value = 0
  document.body.style.overflow = "hidden"
}

function closeLightbox() {
  activeLightboxIndex.value = null
  activeSectionForLightbox.value = null
  document.body.style.overflow = "auto"
}

const nav = (dir: number) => {
  const files = activeSectionForLightbox.value?.files
  if (!files || files.length <= 1) return
  activeLightboxIndex.value = (activeLightboxIndex.value! + dir + files.length) % files.length
}

function downloadFile(url: string, fileName: string) {
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.target = "_blank"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const activeFile = computed(() => {
  if (activeLightboxIndex.value === null || !activeSectionForLightbox.value) return null
  return activeSectionForLightbox.value.files[activeLightboxIndex.value]
})

const activeTitle = computed(() => {
  const section = activeSectionForLightbox.value
  const index = activeLightboxIndex.value

  if (!section || index === null || !experiment?.sections) return ""

  if (section.isPreview) return "Vorschau"

  const sectionIndex = experiment.sections.findIndex(s => s.id === section.id)
  const globalIndex = (sectionImageStartIndices.value[sectionIndex] ?? 0) + index
  return `Abb. ${globalIndex + 1}`
})
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
      @click="openPreviewLightbox"
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
              <CardContent class="h-80 flex items-center justify-center p-0 relative overflow-hidden rounded-t-lg">
                <!-- Image File -->
                <template v-if="isImageFile(item.file.mimeType)">
                  <NuxtPicture
                    format="webp,avif"
                    sizes="100vw md:850px"
                    fit="inside"
                    :src="item.file.path"
                    alt="File Preview"
                    :img-attrs="{
                      class: 'object-contain w-full h-full cursor-zoom-in transition-all duration-300 hover:scale-[1.03]',
                      onClick: () => openLightbox(section, index),
                    }"
                    class="w-full h-full flex items-center justify-center"
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

                <Button
                  v-if="item.file.path"
                  variant="secondary"
                  size="icon"
                  class="absolute top-2 right-2 bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white border-none transition-all z-20 text-slate-900"
                  @click.stop="downloadFile(item.file.path, item.file.originalName)"
                >
                  <Icon
                    name="heroicons:arrow-down-tray"
                    class="w-5 h-5"
                  />
                </Button>
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
            <Card class="h-20 w-full flex items-center justify-center rounded overflow-hidden border-2 border-transparent hover:border-primary/30 hover:bg-black/5 transition-all cursor-pointer">
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
      </div>
    </div>

    <!-- Own rating -->
    <!-- <div v-if="!preview"> -->
    <Separator />
    <ExperimentRatingOwn
      v-if="user"
      :experiment="experiment"
    />
    <ExperimentComment
      :experiment="experiment"
    />
    <!-- </div> -->
  </div>

  <ExperimentLightbox
      :active-file="activeFile"
      :active-section="activeSectionForLightbox"
      :active-title="activeTitle"
      @close="closeLightbox"
      @nav="nav"
      @download="(path, title) => downloadFile(path, title.replace(' ', '_'))"
  />
</template>
