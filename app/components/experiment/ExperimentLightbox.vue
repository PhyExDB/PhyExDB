<script lang="ts" setup>
import type { LightboxSection } from "~/components/ui/carousel/interface"

const props = defineProps<{
  activeFileIndex: number | null
  activeSection: LightboxSection | null
  experimentSections?: LightboxSection[]
}>()

const emit = defineEmits<{
  close: []
  download: [path: string]
}>()

const localIndex = ref<number | null>(null)

watch(() => props.activeFileIndex, (newVal) => {
  localIndex.value = newVal
}, { immediate: true })

const sectionOffsets = computed(() => {
  if (!props.experimentSections) return new Map<string, number>()

  const offsets = new Map<string, number>()
  let currentTotal = 0

  for (const section of props.experimentSections) {
    if (typeof section.id === "string") {
      offsets.set(section.id, currentTotal)
    }
    currentTotal += section.files.length
  }

  return offsets
})

const activeFile = computed(() => {
  if (localIndex.value === null || !props.activeSection) return null
  return props.activeSection.files[localIndex.value]
})

const activeTitle = computed(() => {
  if (!props.activeSection || localIndex.value === null) return ""
  if (props.activeSection.isPreview) return "Titelbild"
  if (!props.experimentSections) return `Abb. ${localIndex.value + 1}`

  const sectionId = String(props.activeSection.id)
  const offset = sectionOffsets.value.get(sectionId) ?? 0

  return `Abb. ${offset + localIndex.value + 1}`
})

const nav = (dir: number) => {
  const files = props.activeSection?.files
  if (!files || files.length <= 1 || localIndex.value === null) return
  localIndex.value = (localIndex.value + dir + files.length) % files.length
}

const handleKeydown = (e: KeyboardEvent) => {
  if (localIndex.value === null) return
  if (e.key === "ArrowLeft") nav(-1)
  if (e.key === "ArrowRight") nav(1)
  if (e.key === "Escape") emit("close")
}

onMounted(() => window.addEventListener("keydown", handleKeydown))
onUnmounted(() => window.removeEventListener("keydown", handleKeydown))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="activeFile"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl p-4 animate-in fade-in duration-300"
      @click.self="emit('close')"
    >
      <div class="absolute top-6 right-6 z-50 flex gap-3">
        <Button
          variant="secondary"
          size="icon"
          class="rounded-full shadow-md"
          @click="emit('download', activeFile.file.path)"
        >
          <Icon
            name="heroicons:arrow-down-tray"
            class="w-6 h-6"
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="rounded-full"
          @click="emit('close')"
        >
          <Icon
            name="heroicons:x-mark"
            class="w-8 h-8"
          />
        </Button>
      </div>

      <template v-if="activeSection && activeSection.files.length > 1">
        <Button
          v-for="d in [-1, 1]"
          :key="d"
          variant="ghost"
          size="icon"
          :class="['fixed z-50 h-20 w-20 hidden md:flex rounded-full', d === -1 ? 'left-4' : 'right-4']"
          @click="nav(d)"
        >
          <Icon
            :name="d === -1 ? 'heroicons:chevron-left' : 'heroicons:chevron-right'"
            class="w-12 h-12"
          />
        </Button>
      </template>

      <div class="flex flex-col items-center max-w-5xl w-full gap-6 select-none">
        <img
          :src="activeFile.file.path"
          class="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl border bg-card/50"
          alt="File Preview"
        >
        <div class="text-center space-y-3 max-w-5xl mx-auto">
          <h3 class="text-2xl font-bold tracking-tight">
            {{ activeTitle }}
          </h3>
          <p
            v-if="activeFile.description"
            class="text-muted-foreground text-sm bg-muted/50 px-4 py-2 rounded-lg border break-words"
          >
            {{ activeFile.description }}
          </p>
        </div>
      </div>

      <div
        v-if="activeSection && activeSection.files.length > 1"
        class="fixed bottom-10 flex gap-12 md:hidden"
      >
        <Button
          v-for="d in [-1, 1]"
          :key="d"
          variant="outline"
          size="icon"
          class="h-14 w-14 rounded-full bg-background/80"
          @click="nav(d)"
        >
          <Icon
            :name="d === -1 ? 'heroicons:chevron-left' : 'heroicons:chevron-right'"
            class="w-8 h-8"
          />
        </Button>
      </div>
    </div>
  </Teleport>
</template>
