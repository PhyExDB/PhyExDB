<script setup lang="ts">
import Draggable from "vuedraggable"
import FavoriteButton from "~/components/experiment/FavoriteButton.vue"
import { useFetch } from "#app"
import type { ExperimentList, ReorderEvent } from "~~/shared/types/Experiment.type"
import type { ExperimentAttributeDetail } from "~~/shared/types/ExperimentAttribute.type"
import { toast } from "~/components/ui/toast"

const newCategoryName = ref("")
const isGroupedByUser = ref(true)
const isAddCategoryDialogOpen = ref(false)
const { favoriteState } = useFavorite()
const { data: rawExperiments, refresh } = await useFetch<ExperimentList[]>("/api/experiments/favorites")
const { data: attributes } = await useFetch<ExperimentAttributeDetail[]>("/api/experiments/attributes")
const experiments = computed(() => {
  return rawExperiments.value?.filter(exp => favoriteState.value[exp.id]) ?? []
})

watch(rawExperiments, (newExps) => {
  if (newExps) {
    newExps.forEach((exp) => {
      if (favoriteState.value[exp.id] === undefined) {
        favoriteState.value[exp.id] = true
      }
    })
  }
}, { immediate: true })

const userCategories = computed(() => {
  const cats = new Set<string>()
  experiments.value.forEach((exp) => {
    if (exp.favoriteCategory) cats.add(exp.favoriteCategory)
  })
  return Array.from(cats).sort()
})

const groupedFavorites = computed(() => {
  if (!experiments.value) return []

  if (isGroupedByUser.value) {
    const groups: Record<string, { name: string, id: string | null, items: ExperimentList[] }> = {}

    userCategories.value.forEach((cat) => {
      groups[cat] = { name: cat, id: cat, items: [] }
    })

    if (!groups["Unkategorisiert"]) {
      groups["Unkategorisiert"] = { name: "Unkategorisiert", id: null, items: [] }
    }

    experiments.value.forEach((exp) => {
      const cat = exp.favoriteCategory || "Unkategorisiert"
      if (!groups[cat]) {
        groups[cat] = { name: cat, id: exp.favoriteCategory || null, items: [] }
      }
      groups[cat].items.push(exp)
    })

    // Unkategorisiert at the top, then alphabetically
    const sortedGroups = Object.values(groups).sort((a, b) => {
      if (a.name === "Unkategorisiert") return -1
      if (b.name === "Unkategorisiert") return 1
      return a.name.localeCompare(b.name)
    })

    return sortedGroups.map(g => ({
      ...g,
      items: g.items.sort((a, b) => (a.favoriteNumberForSequence || 0) - (b.favoriteNumberForSequence || 0)),
    }))
  }

  return [{
    name: "Alle Favoriten",
    id: "all",
    items: [...experiments.value].sort((a, b) => (a.favoriteNumberForSequence || 0) - (b.favoriteNumberForSequence || 0)),
  }]
})

async function onReorder(event: ReorderEvent, group: { name: string, id: string | null, items: ExperimentList[] }) {
  const groupIds = group.items.map((exp: ExperimentList) => exp.id)

  if (isGroupedByUser.value) {
    const experimentId = event.added?.element?.id || event.moved?.element?.id
    if (experimentId) {
      const newCategory = group.id

      await $fetch(`/api/experiments/favorites/category`, {
        method: "POST",
        body: { experimentId, category: newCategory },
      })

      const exp = experiments.value?.find(e => e.id === experimentId)
      if (exp) {
        exp.favoriteCategory = newCategory
      }
    }
  }

  if (event.removed) return

  if (groupIds.length > 0) {
    await $fetch(`/api/experiments/favorites/reorder`, {
      method: "POST",
      body: {
        experimentIds: groupIds,
        category: isGroupedByUser.value ? group.id : undefined,
      },
    })

    await refresh()
  }
}

const temporaryCategories = ref<string[]>([])
const allGroups = computed(() => {
  const groups = [...groupedFavorites.value]

  if (isGroupedByUser.value) {
    temporaryCategories.value.forEach((cat) => {
      if (!groups.find(g => g.name === cat)) {
        groups.push({ name: cat, id: cat, items: [] })
      }
    })
  }
  return groups
})

function addUserCategory() {
  const name = newCategoryName.value.trim()
  if (!name) return

  const exists = userCategories.value.some(cat => cat.toLowerCase() === name.toLowerCase())
    || temporaryCategories.value.some(cat => cat.toLowerCase() === name.toLowerCase())

  if (exists) {
    toast({
      title: "Kategorie existiert bereits",
      description: `Die Kategorie "${name}" ist bereits vorhanden.`,
      variant: "destructive",
    })
    return
  }

  temporaryCategories.value.push(name)
  newCategoryName.value = ""
  isAddCategoryDialogOpen.value = false
}

const isRenameDialogOpen = ref(false)
const categoryToEdit = ref("")
const renamedCategoryName = ref("")

async function renameCategory() {
  const oldName = categoryToEdit.value
  const newName = renamedCategoryName.value.trim()

  if (!newName || oldName === newName) return

  if (userCategories.value.includes(newName)) {
    toast({ title: "Fehler", description: "Name existiert bereits", variant: "destructive" })
    return
  }

  try {
    await $fetch("/api/experiments/favorites/category-action", {
      method: "POST",
      body: { action: "rename", oldName, newName },
    })

    if (rawExperiments.value) {
      rawExperiments.value = rawExperiments.value.map((exp) => {
        if (exp.favoriteCategory === oldName) {
          return { ...exp, favoriteCategory: newName }
        }
        return exp
      })
    }

    temporaryCategories.value = temporaryCategories.value.map(c => c === oldName ? newName : c)

    isRenameDialogOpen.value = false
    toast({ title: "Erfolg", description: "Kategorie umbenannt" })
    await refresh()
  } catch {
    toast({ title: "Fehler", description: "Umbenennen fehlgeschlagen", variant: "destructive" })
  }
}

const isDeleteDialogOpen = ref(false)
const categoryToDelete = ref("")

function openDeleteDialog(name: string) {
  categoryToDelete.value = name
  isDeleteDialogOpen.value = true
}

async function deleteCategory() {
  const name = categoryToDelete.value
  if (!name) return

  try {
    await $fetch("/api/experiments/favorites/category-action", {
      method: "POST",
      body: { action: "delete", oldName: name },
    })

    if (rawExperiments.value) {
      rawExperiments.value = rawExperiments.value.map((exp) => {
        if (exp.favoriteCategory === name) {
          return { ...exp, favoriteCategory: null }
        }
        return exp
      })
    }

    temporaryCategories.value = temporaryCategories.value.filter(c => c !== name)

    isDeleteDialogOpen.value = false
    toast({ title: "Kategorie aufgelöst", description: "Die Experimente sind nun unter 'Unkategorisiert' zu finden." })

    await refresh()
  } catch {
    toast({ title: "Fehler", description: "Löschen fehlgeschlagen", variant: "destructive" })
  }
}

function openRenameDialog(name: string) {
  categoryToEdit.value = name
  renamedCategoryName.value = name
  isRenameDialogOpen.value = true
}
</script>

<template>
  <div class="grid grid-cols-1 gap-6">
    <div class="flex flex-col sm:flex-row gap-4 justify-between items-center">
      <h1 class="text-3xl font-bold text-primary">
        Meine Favoriten
      </h1>

      <div class="flex flex-col sm:flex-row gap-4 items-end">
        <div
          v-if="isGroupedByUser"
          class="flex gap-2 w-full sm:w-auto items-end"
        >
          <Dialog
            :open="isAddCategoryDialogOpen"
            @update:open="isAddCategoryDialogOpen = $event"
          >
            <DialogTrigger as-child>
              <Button variant="outline">
                <Icon
                  name="heroicons:plus"
                  class="mr-2 h-4 w-4"
                />
                Kategorie erstellen
              </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Neue Kategorie erstellen</DialogTitle>
                <DialogDescription>
                  Geben Sie einen Namen für Ihre neue Favoriten-Kategorie ein.
                </DialogDescription>
              </DialogHeader>
              <div class="grid gap-4 py-4">
                <div class="grid grid-cols-4 items-center gap-4">
                  <Label
                    for="name"
                    class="text-right"
                  >Name</Label>
                  <Input
                    id="name"
                    v-model="newCategoryName"
                    class="col-span-3"
                    placeholder="z.B. Klasse 6"
                    @keyup.enter="addUserCategory"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  @click="addUserCategory"
                >
                  Erstellen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div class="w-full sm:w-48">
          <label class="text-sm font-medium mb-1 block">Ansicht:</label>
          <Select
            :model-value="isGroupedByUser.toString()"
            @update:model-value="(val) => isGroupedByUser = val === 'true'"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">
                Eigene Kategorien
              </SelectItem>
              <SelectItem value="false">
                Alle Favoriten
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <div
      v-if="!experiments || experiments.length === 0"
      class="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed"
    >
      <Icon
        name="heroicons:heart"
        class="mx-auto h-12 w-12 text-muted-foreground/50"
      />
      <h3 class="mt-2 text-lg font-semibold text-foreground">
        Keine Favoriten
      </h3>
      <p class="mt-1 text-sm text-muted-foreground">
        Du hast noch keine Experimente als Favoriten markiert.
      </p>
      <div class="mt-6">
        <Button as-child>
          <NuxtLink to="/experiments">Experimente entdecken</NuxtLink>
        </Button>
      </div>
    </div>

    <div
      v-else
      class="space-y-12"
    >
      <div
        v-for="group in allGroups"
        :key="group.name"
        class="space-y-4"
      >
        <div class="flex items-center justify-between border-b pb-2">
          <div class="flex items-center gap-3">
            <h2 class="text-2xl font-semibold">
              {{ group.name }}
            </h2>
            <div
              v-if="group.id !== null && group.id !== 'all'"
              class="flex gap-1"
            >
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8"
                @click="openRenameDialog(group.name)"
              >
                <Icon
                  name="heroicons:pencil-square"
                  class="h-4 w-4"
                />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 text-destructive"
                @click="openDeleteDialog(group.name)"
              >
                <Icon
                  name="heroicons:trash"
                  class="h-4 w-4"
                />
              </Button>
            </div>

            <Dialog
              :open="isDeleteDialogOpen"
              @update:open="isDeleteDialogOpen = $event"
            >
              <DialogContent class="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Kategorie löschen?</DialogTitle>
                  <DialogDescription>
                    Möchtest du die Kategorie <strong>"{{ categoryToDelete }}"</strong> wirklich auflösen?
                    Die enthaltenen Favoriten werden nicht gelöscht, sondern landen wieder unter "Unkategorisiert".
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter class="gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    @click="isDeleteDialogOpen = false"
                  >
                    Abbrechen
                  </Button>
                  <Button
                    variant="destructive"
                    @click="deleteCategory"
                  >
                    Kategorie auflösen
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <span class="text-sm text-muted-foreground">{{ group.items.length }} Experimente</span>
        </div>

        <Draggable
          v-model="group.items"
          item-key="id"
          tag="div"
          class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-h-[150px] p-4 rounded-xl bg-muted/10 border-2 border-transparent transition-colors duration-200"
          ghost-class="opacity-50"
          chosen-class="scale-[1.02]"
          drag-class="rotate-1"
          :animation="200"
          :group="isGroupedByUser ? 'favorites' : undefined"
          :disabled="!isGroupedByUser && group.id !== 'all'"
          @change="(event: any) => onReorder(event, group)"
        >
          <template #item="{ element: experiment }">
            <NuxtLink
              :to="`/experiments/${experiment.slug}`"
              class="relative group border-0 cursor-move active:cursor-grabbing h-full block"
            >
              <Card class="flex flex-col h-full hover:shadow-lg transition-all duration-200 border-2 border-transparent group-hover:border-primary/20 bg-card text-card-foreground">
                <CardContent class="relative grow flex flex-col p-0 rounded-t-lg overflow-hidden">
                  <div class="relative w-full min-h-[150px] flex flex-col items-center justify-center h-full">
                    <NuxtPicture
                      format="webp,avif"
                      width="470"
                      :src="experiment.previewImage?.path ?? 'experiment_placeholder.png'"
                      alt="Preview Image"
                      :img-attrs="{
                        class: 'absolute inset-0 w-full h-full ' + (experiment.previewImage?.path ? 'object-contain' : 'object-cover'),
                      }"
                    />
                    <div class="relative z-10 p-3 w-full bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity h-full flex items-center justify-center">
                      <div class="grid grid-cols-2 gap-1 text-[10px]">
                        <template
                          v-for="attribute in attributes"
                          :key="attribute.id"
                        >
                          <div class="text-right">{{ attribute.name }}:</div>
                          <div class="flex flex-wrap gap-1">
                            <template
                              v-for="attributeValue in (experiment.attributes?.flatMap((a: ExperimentList[]) => a.values) || [])"
                              :key="attributeValue.id"
                            >
                              <Badge
                                v-if="attribute.values.some(v => v.id === attributeValue.id)"
                                class="h-4 text-[8px] px-1 bg-primary text-primary-foreground border-0"
                              >
                                {{ attributeValue.value }}
                              </Badge>
                            </template>
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <Separator />
                <CardFooter class="flex flex-col items-start p-4 gap-2 w-full mt-auto">
                  <CardTitle class="text-foreground/80 text-left flex justify-between w-full items-center">
                    <span class="truncate mr-2 font-bold">{{ experiment.name }}</span>
                    <FavoriteButton
                      :experiment-id="experiment.id"
                      :is-favorited-initial="true"
                    />
                  </CardTitle>
                  <div class="flex gap-2">
                    <Badge
                      variant="outline"
                      class="text-[10px]"
                    >{{ experiment.duration }} Min.</Badge>
                    <ExperimentRating
                      :experiment="experiment"
                      :small="true"
                    />
                  </div>
                </CardFooter>
              </Card>
            </NuxtLink>
          </template>
        </Draggable>
        <p
          v-if="isGroupedByUser"
          class="text-xs text-muted-foreground italic"
        >
          Tipp: Ziehen zum Sortieren oder Verschieben in eine andere Kategorie
        </p>
      </div>
    </div>

    <Dialog
      :open="isRenameDialogOpen"
      @update:open="isRenameDialogOpen = $event"
    >
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kategorie umbenennen</DialogTitle>
          <DialogDescription>Gib einen neuen Namen für "{{ categoryToEdit }}" ein.</DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <Input
            v-model="renamedCategoryName"
            placeholder="Neuer Name..."
            @keyup.enter="renameCategory"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            @click="isRenameDialogOpen = false"
          >
            Abbrechen
          </Button>
          <Button @click="renameCategory">
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
