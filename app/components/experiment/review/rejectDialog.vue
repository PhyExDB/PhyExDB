<script lang="ts" setup>
import type { PropType } from "vue"

const { onDelete } = defineProps({
  onDelete: {
    type: Function as PropType<() => Promise<void>>,
    required: true,
  },
})

const loading = ref(false)
const open = ref(false)

async function submit() {
  if (loading.value) return
  loading.value = true

  try {
    await onDelete()
    open.value = false
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Dialog
    :open="open"
    @update:open="open = $event"
  >
    <slot />

    <DialogContent>
      <DialogHeader>
        <DialogTitle>Versuch beanstanden</DialogTitle>
        <DialogDescription>
          Möchten Sie diesen Versuch wirklich beanstanden?
          <br>
          Die Beanstandungen werden gespeichert und dem Autor angezeigt.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter class="flex flex-col sm:flex-row gap-2">
        <DialogClose as-child>
          <Button
            type="button"
            variant="outline"
            :disabled="loading"
          >
            Abbrechen
          </Button>
        </DialogClose>

        <Button
          variant="destructive"
          :disabled="loading"
          @click="submit"
        >
          Beanstandung senden
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
