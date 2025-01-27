<script setup lang="ts">
import { onMounted, ref } from "vue"
import { h } from "vue"
import { ArrowUpDown } from "lucide-vue-next"
import RoleDropdown from "~~/app/components/AdminUserTable/role-dropdown.vue"
import { Button } from "@/components/ui/button"
import type {
  ColumnDef,
  SortingState,
} from "@tanstack/vue-table"
import {
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const data = shallowRef<UserDetail[]>([])

async function getData(): Promise<UserDetail[]> {
  // Fetch data from your API here.
  const data = await useAuth().client.admin.listUsers({
    query: {
      limit: 10,
    },
  })
  return (data.data?.users ?? []) as UserDetail[]
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
      return h(RoleDropdown, { ...row.original, index: row.index })
    },
  },
]

const sorting = ref<SortingState>([])

const table = useVueTable({
  get data() { return data },
  get columns() { return columns },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  state: {
    get sorting() { return sorting.value },
  },
})

onMounted(async () => {
  console.log("fetching data")
  data.value = await getData()
})
</script>

<template>
  <div class="container py-10 mx-auto">
    <div class="w-full">
    <div class="flex gap-2 items-center py-4">
      <Input
        class="max-w-sm"
        placeholder="Filter emails..."
        :model-value="table.getColumn('email')?.getFilterValue() as string"
        @update:model-value=" table.getColumn('email')?.setFilterValue($event)"
      />
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            variant="outline"
            class="ml-auto"
          >
            Spalten <ChevronDown class="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuCheckboxItem
            v-for="column in table.getAllColumns().filter((column) => column.getCanHide())"
            :key="column.id"
            class="capitalize"
            :checked="column.getIsVisible()"
            @update:checked="(value) => {
              column.toggleVisibility(!!value)
            }"
          >
            {{ column.id }}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div class="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() ? 'selected' : undefined"
            >
              <TableCell
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
              >
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow>
              <TableCell
                :colspan="columns.length"
                class="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
  </div>
</template>
