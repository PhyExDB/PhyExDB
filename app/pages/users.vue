<script setup lang="ts">
import type {
  ColumnDef,
} from "@tanstack/vue-table"
import RoleDropdown from "~/components/AdminUserTable/role-dropdown.vue"
import DropdownAction from "~/components/AdminUserTable/data-table-dropdown.vue"

authorize(userAbilities.getAll)

const data = ref<UserDetailAdmin[]>([])
const route = useRoute()
const pageMeta = ref<PageMeta>({
  page: parseInt(route.query.page as string, 10) || 1,
  pageSize: parseInt(route.query.pageSize as string, 10) || 12,
  total: 0,
  totalPages: 0,
})

async function fetch() {
  const newData = await $fetch(
    `/api/users?page=${pageMeta.value.page}&pageSize=${pageMeta.value.pageSize}`,
  )
  data.value = newData.items
  pageMeta.value = newData.pagination
}
onMounted(fetch)

function handlePageChanged(newPage: number) {
  pageMeta.value.page = newPage
  fetch()
}

async function updateRow(index: number, user: UserDetailAdmin) {
  const updatedData = [...data.value]
  updatedData[index] = user
  data.value = updatedData
}

function handleChange(row: { index: number, original: UserDetailAdmin }) {
  return function (updated: Partial<UserDetailAdmin>) {
    updateRow(row.index, { ...row.original, ...updated })
  }
}

const columns: ColumnDef<UserDetailAdmin>[] = [
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
        onChanged: handleChange(row),
      })
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return h(DropdownAction, { user: row.original, onDeleted: fetch, onChanged: handleChange(row) })
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
