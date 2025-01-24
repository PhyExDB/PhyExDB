import { h } from "vue"
import type {
  ColumnDef,
} from "@tanstack/vue-table"

/**
 * Defines the column configuration for the AdminUserTable component.
 */
export const columns: ColumnDef<UserDetail>[] = [
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
      return capitalizeFirstLetter(row.getValue("role"))
    },
  },
]
