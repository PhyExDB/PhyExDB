<script setup lang="ts">
import type {
  ColumnDef,
} from "@tanstack/vue-table"
import RoleDropdown from "~/components/AdminUserTable/role-dropdown.vue"

const data = ref<UserDetail[]>([])
const route = useRoute()
const pageMeta = ref<PageMeta>({
  page: parseInt(route.query.page as string, 10) || 1,
  pageSize: parseInt(route.query.pageSize as string, 10) || 12,
  total: 0,
  totalPages: 0,
})

const fetch = async () => {
  const { data: newData } = await useAPI<Page<UserDetail>>(
    `/api/users?page=${pageMeta.value.page}&pageSize=${pageMeta.value.pageSize}`,
  )
  if (!newData.value) return
  data.value = newData.value!.items
  pageMeta.value = newData.value!.pagination
}
fetch()

function handlePageChanged(newPage: number) {
  pageMeta.value.page = newPage
  fetch()
}

async function updateRow(index: number, user: UserDetail) {
  const updatedData = [...data.value]
  updatedData[index] = user
  data.value = updatedData
}

const columns: ColumnDef<UserDetail>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return row.getValue("name")
    },
  },
  {
    accessorKey: "email",
    header: "E-Mail",
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
        },
      })
    },
  },
]
</script>

<template>
  <div class="container py-10 mx-auto">
    <AdminUserTableDataTable
      :columns="columns"
      :data="data"
    />
    <MyPagination
      :page-meta="pageMeta"
      @page-changed="handlePageChanged"
    />
  </div>
</template>
