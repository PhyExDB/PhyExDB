<script lang="ts" setup>
const { header, message, onDelete } = defineProps({
  header: {
    type: String,
    default: "Sind sie sich sicher?",
    required: false,
  },
  message: {
    type: String,
    default: "Diese Aktion kann nicht rückgängig gemacht werden.",
    required: false,
  },
  onDelete: {
    type: Function,
    required: true,
  },
})

const visible = defineModel<boolean>()
</script>

<template>
  <AlertDialog :open="visible">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ header }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{ message }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="visible = false">
          Abbrechen
        </AlertDialogCancel>
        <AlertDialogAction 
          class="hover:bg-destructive hover:text-destructive-foreground"  
          @click="visible = false; onDelete()"
        >
          Löschen
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<style>

</style>
