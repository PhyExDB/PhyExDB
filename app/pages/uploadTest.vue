<script setup lang="ts">
const { handleFileInput, files } = useFileStorage()

const uploadedFiles = ref<FileDetail[]>([])

async function submit() {
  const response = await $fetch("/api/files", {
    method: "POST",
    body: {
      files: files.value,
    },
  })
  uploadedFiles.value.push(...response)
  console.log(uploadedFiles.value)
}

async function deleteFile(id: string) {
  const response = await $fetch(`/api/files/${id}`, {
    method: "DELETE",
  })
  uploadedFiles.value = uploadedFiles.value.filter(file => file.id !== id)
  console.log(response)
}
</script>

<template>
  <div>
    <div class="flex flex-row gap-4">
      <Input
        type="file"
        multiple
        @input="handleFileInput"
      />
      <Button @click="submit">
        submit
      </Button>
    </div>
    <div class="flex flex-col gap-4">
      <div
        v-for="file in uploadedFiles"
        :key="file.id"
      >
        <div>{{ file.id }}</div>
        <div>{{ file.path }}</div>
        <div>{{ file.mimeType }}</div>
        <NuxtImg
          :src="file.path"
        />
        <Button @click="deleteFile(file.id)">
          Delete
        </Button>
      </div>
    </div>
  </div>
</template>
