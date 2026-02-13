<script setup lang="ts">
const props = defineProps<{
  isRenameOpen: boolean
  isDeleteOpen: boolean
  categoryToEdit: string
  categoryToDelete: string
}>()

const emit = defineEmits<{
  (e: "update:isRenameOpen" | "update:isDeleteOpen", val: boolean): void
  (e: "confirmRename", newName: string): void
  (e: "confirmDelete"): void
}>()

const localNewName = ref("")

watch(() => props.isRenameOpen, (isOpen) => {
  if (isOpen) localNewName.value = props.categoryToEdit
})
</script>

<template>
  <div>
    <Dialog
      :open="isRenameOpen"
      @update:open="emit('update:isRenameOpen', $event)"
    >
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kategorie umbenennen</DialogTitle>
          <DialogDescription>Gib einen neuen Namen für "{{ categoryToEdit }}" ein.</DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <Input
            v-model="localNewName"
            placeholder="Neuer Name..."
            @keyup.enter="emit('confirmRename', localNewName)"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            @click="emit('update:isRenameOpen', false)"
          >
            Abbrechen
          </Button>
          <Button @click="emit('confirmRename', localNewName)">
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog
      :open="isDeleteOpen"
      @update:open="emit('update:isDeleteOpen', $event)"
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
            @click="emit('update:isDeleteOpen', false)"
          >
            Abbrechen
          </Button>
          <Button
            variant="destructive"
            @click="emit('confirmDelete')"
          >
            Kategorie auflösen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
