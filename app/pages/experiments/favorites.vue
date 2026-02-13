<script setup lang="ts">
import Draggable from "vuedraggable"
import type { ExperimentList, ReorderEvent } from "~~/shared/types/Experiment.type"
import type { ExperimentAttributeDetail } from "~~/shared/types/ExperimentAttribute.type"
import { toast } from "~/components/ui/toast"
import FavoriteActionDialogs from "~/components/experiment/favorites/FavoriteActionDialogs.vue"
import FavoriteCard from "~/components/experiment/favorites/FavoriteCard.vue"

const newCategoryName = ref("")
const isGroupedByUser = ref(true)
const isAddCategoryDialogOpen = ref(false)
const isRenameDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const categoryToEdit = ref("")
const categoryToDelete = ref("")
const temporaryCategories = ref<string[]>([])

const { favoriteState } = useFavorite()
const { data: rawExperiments, refresh } = await useFetch<ExperimentList[]>("/api/experiments/favorites")
const { data: attributes } = await useFetch<ExperimentAttributeDetail[]>("/api/experiments/attributes")
const experiments = computed(() => {
  return rawExperiments.value?.filter(exp => favoriteState.value[exp.id]) ?? []
})

watch(rawExperiments, (newExps) => {
  newExps?.forEach((exp) => {
    if (favoriteState.value[exp.id] === undefined) favoriteState.value[exp.id] = true
  })
}, { immediate: true })

const groupedFavorites = computed(() => {
  if (!experiments.value.length) return []

  if (!isGroupedByUser.value) {
    return [{
      name: "Alle Favoriten",
      id: "all",
      items: [...experiments.value].sort((a, b) => (a.favoriteNumberForSequence || 0) - (b.favoriteNumberForSequence || 0)),
    }]
  }

  const groups: Record<string, { name: string, id: string | null, items: ExperimentList[] }> = {}

  const allCats = new Set([...temporaryCategories.value, ...experiments.value.map(e => e.favoriteCategory).filter(Boolean) as string[]])

  if (!allCats.has("Unkategorisiert")) groups["Unkategorisiert"] = { name: "Unkategorisiert", id: null, items: [] }
  allCats.forEach(cat => groups[cat] = { name: cat, id: cat, items: [] })

  experiments.value.forEach((exp) => {
    const cat = exp.favoriteCategory || "Unkategorisiert"
    if (!groups[cat]) groups[cat] = { name: cat, id: null, items: [] }
    groups[cat].items.push(exp)
  })

  return Object.values(groups)
    .sort((a, b) => a.name === "Unkategorisiert" ? -1 : (b.name === "Unkategorisiert" ? 1 : a.name.localeCompare(b.name)))
    .map(g => ({ ...g, items: g.items.sort((a, b) => (a.favoriteNumberForSequence || 0) - (b.favoriteNumberForSequence || 0)) }))
})

async function onReorder(event: ReorderEvent, group: { name: string, id: string | null, items: ExperimentList[] }) {
  if (event.removed) return
  const experimentId = event.added?.element?.id || event.moved?.element?.id

  if (isGroupedByUser.value && experimentId) {
    await $fetch("/api/experiments/favorites/category", {
      method: "POST",
      body: { experimentId, category: group.id },
    })
    const exp = rawExperiments.value?.find(e => e.id === experimentId)
    if (exp) exp.favoriteCategory = group.id
  }

  await $fetch("/api/experiments/favorites/reorder", {
    method: "POST",
    body: { experimentIds: group.items.map((e: ExperimentList) => e.id), category: isGroupedByUser.value ? group.id : undefined },
  })
  await refresh()
}

async function executeCategoryAction(action: "rename" | "delete", newNameInput?: string) {
  const oldName = action === "rename" ? categoryToEdit.value : categoryToDelete.value
  const newName = newNameInput?.trim()

  if (action === "rename" && (!newName || oldName === newName)) return
  if (action === "rename" && groupedFavorites.value.some(g => g.name === newName)) {
    toast({ title: "Fehler", description: "Name existiert bereits", variant: "destructive" })
    return
  }

  try {
    await $fetch("/api/experiments/favorites/category-action", {
      method: "POST",
      body: { action, oldName, newName: action === "rename" ? newName : undefined },
    })

    if (rawExperiments.value) {
      rawExperiments.value = rawExperiments.value.map((exp) => {
        if (exp.favoriteCategory === oldName) {
          return { ...exp, favoriteCategory: action === "rename" ? newName : null }
        }
        return exp
      })
    }

    if (action === "rename") {
      temporaryCategories.value = temporaryCategories.value.map(c => c === oldName ? newName! : c)
      toast({ title: "Erfolg", description: "Kategorie umbenannt", variant: "success" })
    } else {
      temporaryCategories.value = temporaryCategories.value.filter(c => c !== oldName)
      toast({ title: "Kategorie aufgelöst", description: "Die Experimente sind nun unter 'Unkategorisiert' zu finden.", variant: "success" })
    }

    isRenameDialogOpen.value = false
    isDeleteDialogOpen.value = false
    await refresh()
  } catch {
    toast({ title: "Fehler", description: "Aktion fehlgeschlagen", variant: "destructive" })
  }
}

function addUserCategory() {
  const name = newCategoryName.value.trim()
  if (!name) return
  if (groupedFavorites.value.some(g => g.name.toLowerCase() === name.toLowerCase())) {
    toast({ title: "Fehler", description: "Kategorie existiert bereits", variant: "destructive" })
    return
  }
  temporaryCategories.value.push(name)
  newCategoryName.value = ""
  isAddCategoryDialogOpen.value = false
}

function openRenameDialog(name: string) {
  categoryToEdit.value = name
  isRenameDialogOpen.value = true
}

function openDeleteDialog(name: string) {
  categoryToDelete.value = name
  isDeleteDialogOpen.value = true
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
        v-for="group in groupedFavorites"
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
                class="text-destructive"
                @click="openDeleteDialog(group.name)"
              >
                <Icon
                  name="heroicons:trash"
                  class="h-4 w-4"
                />
              </Button>
            </div>
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
          <template #item="{ element }">
            <FavoriteCard
              :experiment="element"
              :attributes="attributes"
            />
          </template>
        </Draggable>
        <p
          v-if="isGroupedByUser"
          class="text-xs text-muted-foreground italic"
        >
          Tipp: Ziehen zum Sortieren oder Verschieben.
        </p>
      </div>
    </div>

    <FavoriteActionDialogs
      v-model:is-rename-open="isRenameDialogOpen"
      v-model:is-delete-open="isDeleteDialogOpen"
      :category-to-edit="categoryToEdit"
      :category-to-delete="categoryToDelete"
      @confirm-rename="(name: string | undefined) => executeCategoryAction('rename', name)"
      @confirm-delete="executeCategoryAction('delete')"
    />
  </div>
</template>
