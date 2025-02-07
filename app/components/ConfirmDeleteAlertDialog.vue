<script lang="ts" setup>
const { header, message, onDelete } = defineProps({
  header: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  onDelete: {
    type: Function,
    required: true,
  },
})
</script>

<template>
  <AlertDialog>
    <AlertDialogTrigger as-child>
      <slot />
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ header }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{ message }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>
          Abbrechen
        </AlertDialogCancel>
        <AlertDialogAction
          class="hover:bg-destructive hover:text-destructive-foreground"
          @click="onDelete()"
        >
          Löschen
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<style>

</style>
