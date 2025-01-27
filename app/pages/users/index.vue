<script setup lang="ts">
import { onMounted, ref } from "vue"
import type {
  ColumnDef,
} from "@tanstack/vue-table"
import { ArrowUpDown } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import RoleDropdown from "~/components/AdminUserTable/role-dropdown.vue"

const data = ref<UserDetail[]>([])
const pageMeta = ref<PageMeta | undefined>(undefined)

const route = useRoute()
const currentPage = ref(parseInt(route.query.page as string, 10) || 1)
const itemsPerPage = ref(parseInt(route.query.pageSize as string, 10) || 12)

// async function getData(): Promise<UserDetail[]> {
//   // Fetch data from your API here.
//   const data = await useAuth().client.admin.listUsers({
//     query: {
//       limit: 10,
//     },
//   })
//   return (data.data?.users ?? []) as UserDetail[]
// }
const fetch = async () => {
  const { data: newData } = await useAPI<Page<UserDetail>>(
    `/api/users?page=${currentPage.value}&pageSize=${itemsPerPage.value}`,
  )
  if (!newData.value) return
  data.value = newData.value!.items
  pageMeta.value = newData.value!.pagination
}
fetch()
watch(currentPage, fetch)

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
</script>

<template>
  <div class="container py-10 mx-auto">
    <AdminUserTableDataTable
      :columns="columns"
      :data="data"
    />
    <!-- Pagination -->
    <div
      v-if="pageMeta?.total > itemsPerPage"
      class="p-8"
    >
      <Pagination
        v-slot="{ page }"
        :items-per-page="itemsPerPage"
        :total="pageMeta?.total"
        :sibling-count="1"
        show-edges
        :default-page="currentPage"
        class="flex flex-row grow gap-4 justify-center items-center"
        @update:page="currentPage = $event"
      >
        <PaginationList
          v-slot="{ items }"
          class="flex items-center gap-1"
        >
          <PaginationFirst />
          <PaginationPrev />

          <template v-for="(item, index) in items">
            <PaginationListItem
              v-if="item.type === 'page'"
              :key="index"
              :value="item.value"
              as-child
            >
              <Button
                class="w-10 h-10 p-0"
                :variant="item.value === page ? 'default' : 'outline'"
              >
                {{ item.value }}
              </Button>
            </PaginationListItem>
            <PaginationEllipsis
              v-else
              :key="item.type"
              :index="index"
            />
          </template>

          <PaginationNext />
          <PaginationLast />
        </PaginationList>
      </Pagination>
    </div>
  </div>
</template>
