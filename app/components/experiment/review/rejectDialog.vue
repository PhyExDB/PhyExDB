<script lang="ts" setup>
import type { PropType } from "vue"

const props = defineProps({
  onDelete: {
    type: Function as PropType<() => Promise<void>>,
    required: true,
  },
})

const open = defineModel<boolean>("open", { default: false })
const loading = ref(false)

async function submit() {
  if (loading.value) return
  loading.value = true

  try {
    await props.onDelete()
    open.value = false
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Dialog
    v-model:open="open"
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
