<script setup lang="ts">
import type {
  ColumnDef,
} from "@tanstack/vue-table"
import RoleDropdown from "~/components/AdminUserTable/role-dropdown.vue"
import DropdownAction from "~/components/AdminUserTable/actions.vue"
import Email from "~/components/user/Email.vue"

authorize(userAbilities.getAll)
const user = await useUser()

const { page, pageSize } = getRequestPageMeta()
// Search
const route = useRoute()
const search = ref<string>(route.query.search as string || "")
const searchApiInput = ref<string>(search.value)

let searchTimeout: NodeJS.Timeout
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchApiInput.value = search.value
  }, 500)
})

watch(searchApiInput, () => {
  page.value = 1
})

const router = useRouter()
watch(search, () => {
  router.replace({ path: route.path, query: { ...route.query, search: search.value } })
})

const { data, refresh } = useLazyFetch("/api/users", {
  query: {
    page: page,
    pageSize: pageSize,
    search: searchApiInput,
  },
})

async function updateRow(_index: number, _user: UserDetailAdmin) {
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
    header: () => "Name",
    cell: ({ row }) => {
      return row.getValue("name")
    },
  },
  {
    accessorKey: "email",
    header: () => "E-Mail",
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
    cell: ({ row }) => {
      if (row.original.id === user.value?.id) return null
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
      v-model="page"
      :page-meta="data?.pagination"
    />
  </div>
</template>
