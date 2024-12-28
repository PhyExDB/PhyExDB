<script setup lang="ts">
const { handleFileInput, files } = useFileStorage()

const submit = async () => {
  const response = await $fetch("/api/files", {
    method: "POST",
    body: {
      files: files.value,
    },
  })
  console.log(response)
}
</script>

<template>
  <div>
    <Input
      type="file"
      multiple
      @input="handleFileInput"
    />
    <Button @click="submit">
      submit
    </Button>
  </div>
</template>
