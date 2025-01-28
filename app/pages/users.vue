<script setup lang="ts">
import type {
  ColumnDef,
} from "@tanstack/vue-table"
import RoleDropdown from "~/components/AdminUserTable/role-dropdown.vue"
import DropdownAction from "~/components/AdminUserTable/data-table-dropdown.vue"
import Email from "~/components/user/Email.vue"

authorize(userAbilities.getAll)

const { page, pageSize } = getRequestPageMeta()
const search = ref<string>("")

const { data, refresh } = useLazyFetch('/api/users', {
  query: {
    page: page,
    pageSize: pageSize,
    search: search,
  }
})

async function updateRow(index: number, user: UserDetailAdmin) {
  refresh()
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
      return h(Email, row.original)
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
      return h(DropdownAction, { user: row.original, onDeleted: refresh, onChanged: handleChange(row) })
    },
  },
]
</script>

<template>
  <div class="container py-10 mx-auto">
    <AdminUserTableDataTable
      v-if="data"
      v-model="search"
      :columns="columns"
      :data="data.items"
    />
    <MyPagination
      :page-meta="data?.pagination"
      v-model="page"
    />
  </div>
</template>
