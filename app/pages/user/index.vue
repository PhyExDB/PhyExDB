<script setup lang="ts">
import { onMounted, ref } from "vue"
import { columns } from "~~/app/components/AdminUserTable/columns"

const data = ref<UserDetail[]>([])

async function getData(): Promise<UserDetail[]> {
  // Fetch data from your API here.
  const data = await useAuth().client.admin.listUsers({
    query: {
      limit: 10,
    },
  })
  return (data.data?.users ?? []) as UserDetail[]
}

onMounted(async () => {
  data.value = await getData()
})
</script>

<template>
  <div class="container py-10 mx-auto">
    <AdminUserTableDataTable
      :columns="columns"
      :data="data"
    />
  </div>
</template>
