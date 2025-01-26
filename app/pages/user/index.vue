<script setup lang="ts">
import { onMounted, ref } from "vue"
import type {
  ColumnDef,
} from "@tanstack/vue-table"
import { ArrowUpDown } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import RoleDropdown from "~/components/AdminUserTable/role-dropdown.vue"

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

async function updateRow(index: number, user: UserDetail){
  const updatedData = [...data.value];
  updatedData[index] = user;
  data.value = updatedData;
}

const columns: ColumnDef<UserDetail>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return h(Button, {
        variant: "ghost",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }, () => ["Name", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })])
    },
    cell: ({ row }) => {
      return row.getValue("name")
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return h(Button, {
        variant: "ghost",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }, () => ["E-Mail", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })])
    },
    cell: ({ row }) => {
      return row.getValue("email")
    },
  },
  {
    accessorKey: "emailVerified",
    header: () => "Email Verifiziert",
    cell: ({ row }) => {
      return row.getValue("emailVerified") ? "verifiziert" : "unverifiziert"
    },
  },
  {
    accessorKey: "role",
    header: () => "Role",
    cell: ({ row }) => {
      return h(RoleDropdown, { 
        ...row.original, 
        onRoleChanged: async (role: UserRole) => {
          row.original.role = role
          updateRow(row.index, row.original)
        }
      })
    },
  },
]

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
    <Button @click="updateRow(2, data[0]!)">Update Data</Button>
  </div>
</template>
