<script setup lang="ts">
import { useToast } from "@/components/ui/toast/use-toast"
import { experimentAttributeAbilities } from "~~/shared/utils/abilities"

definePageMeta({
  title: "Kategorien verwalten",
  description: "Verwalte die Kategorien für Experimente",
})

authorize(experimentAttributeAbilities.getAll)

const { toast } = useToast()
const { data: attributes, refresh } = await useFetch("/api/experiments/attributes")

const newAttributeName = ref("")
const newAttributeMultipleSelection = ref(false)
const isAddingAttribute = ref(false)

async function addAttribute() {
  const name = newAttributeName.value.trim()
  if (!name || name.length <= 3) {
    toast({
      title: "Name zu kurz",
      description: "Der Name muss mindestens 4 Zeichen lang sein.",
      variant: "destructive",
    })
    return
  }

  try {
    await $fetch("/api/experiments/attributes", {
      method: "POST",
      body: {
        name: newAttributeName.value,
        multipleSelection: newAttributeMultipleSelection.value,
        values: [],
      },
    })
    newAttributeName.value = ""
    newAttributeMultipleSelection.value = false
    isAddingAttribute.value = false
    await refresh()
    toast({ title: "Kategorie hinzugefügt", variant: "success" })
  } catch (e) {
    console.error(e)
    toast({ title: "Fehler beim Hinzufügen", variant: "destructive" })
  }
}

async function deleteAttribute(slug: string) {
  try {
    await $fetch(`/api/experiments/attributes/${slug}`, {
      method: "DELETE",
    })
    await refresh()
    toast({ title: "Kategorie gelöscht", variant: "success" })
  } catch (e) {
    console.error(e)
    toast({ title: "Fehler beim Löschen", variant: "destructive" })
  }
}

const editingAttribute = ref<ExperimentAttributeDetail | null>(null)
function startEditing(attribute: ExperimentAttributeDetail) {
  editingAttribute.value = structuredClone(attribute)
}

async function updateAttribute() {
  const name = editingAttribute.value?.name?.trim()
  if (!name || name.length <= 3) {
    toast({
      title: "Name zu kurz",
      description: "Der Name muss mindestens 4 Zeichen lang sein.",
      variant: "destructive",
    })
    return
  }

  try {
    await $fetch(`/api/experiments/attributes/${editingAttribute.value!.slug}`, {
      method: "PUT",
      body: {
        name: name,
        multipleSelection: editingAttribute.value!.multipleSelection,
      },
    })
    editingAttribute.value = null
    await refresh()
    toast({ title: "Kategorie aktualisiert", variant: "success" })
  } catch (e) {
    console.error(e)
    toast({ title: "Fehler beim Aktualisieren", variant: "destructive" })
  }
}

const newValueNames = ref<Record<string, string>>({})
async function addValue(attributeId: string) {
  const name = newValueNames.value[attributeId]?.trim()
  if (!name || name.length <= 3) {
    toast({
      title: "Name zu kurz",
      description: "Der Name muss mindestens 4 Zeichen lang sein.",
      variant: "destructive",
    })
    return
  }

  try {
    await $fetch("/api/experiments/attributes/values", {
      method: "POST",
      body: {
        value: name,
        attribute: attributeId,
      },
    })
    newValueNames.value[attributeId] = ""
    await refresh()
    toast({ title: "Option hinzugefügt", variant: "success" })
  } catch (e) {
    console.error(e)
    toast({ title: "Fehler beim Hinzufügen", variant: "destructive" })
  }
}

async function deleteValue(slug: string) {
  try {
    await $fetch(`/api/experiments/attributes/values/${slug}`, {
      method: "DELETE",
    })
    await refresh()
    toast({ title: "Option gelöscht", variant: "success" })
  } catch (e) {
    console.error(e)
    toast({ title: "Fehler beim Löschen", variant: "destructive" })
  }
}

const editingValue = ref<ExperimentAttributeValueList | null>(null)
function startEditingValue(val: ExperimentAttributeValueList) {
  editingValue.value = structuredClone(val)
}

async function updateValue() {
  const name = editingValue.value?.value?.trim()
  if (!name || name.length <= 3) {
    toast({
      title: "Name zu kurz",
      description: "Der Name muss mindestens 4 Zeichen lang sein.",
      variant: "destructive",
    })
    return
  }

  try {
    await $fetch(`/api/experiments/attributes/values/${editingValue.value!.slug}`, {
      method: "PUT",
      body: {
        value: name,
      },
    })
    editingValue.value = null
    await refresh()
    toast({ title: "Option aktualisiert", variant: "success" })
  } catch (e) {
    console.error(e)
    toast({ title: "Fehler beim Aktualisieren", variant: "destructive" })
  }
}
</script>

<template>
  <div class="container py-10 mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">
        Kategorien verwalten
      </h1>
      <Dialog v-model:open="isAddingAttribute">
        <DialogTrigger as-child>
          <Button>Kategorie hinzufügen</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Kategorie</DialogTitle>
          </DialogHeader>
          <div class="space-y-4 py-4">
            <div class="space-y-2">
              <Label for="name">Name</Label>
              <Input
                id="name"
                v-model="newAttributeName"
                placeholder="z.B. Themenbereich"
              />
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox
                id="multiple"
                :checked="newAttributeMultipleSelection"
                @update:checked="newAttributeMultipleSelection = $event"
              />
              <Label for="multiple">Mehrfachauswahl erlauben</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              @click="isAddingAttribute = false"
            >
              Abbrechen
            </Button>
            <Button
              :disabled="(newAttributeName?.trim()?.length ?? 0) <= 3"
              @click="addAttribute"
            >
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card
        v-for="attribute in attributes"
        :key="attribute.id"
      >
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-xl font-bold">
            {{ attribute.name }}
          </CardTitle>
          <div class="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              @click="startEditing(attribute)"
            >
              <Icon name="heroicons:pencil" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon"
                  class="text-destructive"
                >
                  <Icon name="heroicons:trash" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Kategorie löschen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Dies wird die Kategorie und alle ihre zugeordneten Werte dauerhaft löschen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction
                    class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    @click="deleteAttribute(attribute.slug)"
                  >
                    Löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-xs text-muted-foreground mb-4">
            {{ attribute.multipleSelection ? 'Mehrfachauswahl' : 'Einfachauswahl' }}
          </div>

          <div class="space-y-2">
            <div class="font-semibold text-sm">
              Optionen:
            </div>
            <div class="flex flex-wrap gap-2">
              <Badge
                v-for="val in attribute.values"
                :key="val.id"
                variant="secondary"
                class="flex items-center gap-1"
              >
                {{ val.value }}
                <div class="flex items-center ml-1 space-x-1">
                  <button
                    class="hover:text-primary transition-colors"
                    @click="startEditingValue(val)"
                  >
                    <Icon
                      name="heroicons:pencil"
                      size="12"
                    />
                  </button>
                  <button
                    class="hover:text-destructive transition-colors"
                    @click="deleteValue(val.slug)"
                  >
                    <Icon
                      name="heroicons:x-mark"
                      size="12"
                    />
                  </button>
                </div>
              </Badge>
            </div>
            <div class="flex gap-2 mt-2">
              <Input
                v-model="newValueNames[attribute.id]"
                placeholder="Neue Option..."
                size="sm"
                class="h-8"
                @keyup.enter="addValue(attribute.id)"
              />
              <Button
                size="sm"
                class="h-8"
                :disabled="(newValueNames[attribute.id]?.trim()?.length ?? 0) <= 3"
                @click="addValue(attribute.id)"
              >
                <Icon name="heroicons:plus" />
              </Button>
            </div>
          </div>

          <div class="mt-6">
            <div class="font-semibold text-sm mb-2">
              Vorschau (Dropdown):
            </div>
            <MultiSelect
              :options="attribute.values"
              :multiple="attribute.multipleSelection"
              :value-for-option="option => option.value"
            >
              <template #empty>
                Keine Optionen gefunden.
              </template>
              <template #preview="{ selected }">
                {{ selected.length ? selected.map(val => attribute.values.find(v => v.value === val)?.value).join(", ") : "Auswählen" }}
              </template>
              <template #option="{ option }">
                {{ option.value }}
              </template>
            </MultiSelect>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Edit Attribute Dialog -->
    <Dialog
      :open="!!editingAttribute"
      @update:open="editingAttribute = null"
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kategorie bearbeiten</DialogTitle>
        </DialogHeader>
        <div
          v-if="editingAttribute"
          class="space-y-4 py-4"
        >
          <div class="space-y-2">
            <Label for="edit-name">Name</Label>
            <Input
              id="edit-name"
              v-model="editingAttribute.name"
            />
          </div>
          <div class="flex items-center space-x-2">
            <Checkbox
              id="edit-multiple"
              :checked="editingAttribute.multipleSelection"
              @update:checked="editingAttribute.multipleSelection = $event"
            />
            <Label for="edit-multiple">Mehrfachauswahl erlauben</Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            @click="editingAttribute = null"
          >
            Abbrechen
          </Button>
          <Button
            :disabled="!editingAttribute?.name || editingAttribute.name.trim().length <= 3"
            @click="updateAttribute"
          >
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Edit Value Dialog -->
    <Dialog
      :open="!!editingValue"
      @update:open="editingValue = null"
    >
      <DialogContent v-if="editingValue">
        <DialogHeader>
          <DialogTitle>Option bearbeiten</DialogTitle>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="edit-value">Name der Option</Label>
            <Input
              id="edit-value"
              v-model="editingValue.value"
              @keyup.enter="editingValue.value.trim().length > 3 && updateValue()"
            />
            <p
              v-if="editingValue.value.trim().length <= 3"
              class="text-[10px] text-destructive"
            >
              Mindestens 4 Zeichen erforderlich.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            @click="editingValue = null"
          >
            Abbrechen
          </Button>
          <Button
            :disabled="!editingValue.value || editingValue.value.trim().length <= 3"
            @click="updateValue"
          >
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
