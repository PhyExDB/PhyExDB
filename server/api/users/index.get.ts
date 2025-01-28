import type { Prisma } from "@prisma/client"
import { getQuery } from "h3"
import { userAbilities } from "~~/shared/utils/abilities"
import { authorize } from "~~/server/utils/authorization"
import type { UserDetailAdmin } from "~~/shared/types"
import { getPageMeta, getPaginationPrismaParam } from "~~/server/utils/pagination"

export default defineEventHandler(async (event) => {
  await authorize(event, userAbilities.getAll)

  const query = getQuery(event)
  const search: string = query.search as string

  let whereClause: Prisma.UserWhereInput = {}
  if (search) {
    const roleFilter: Prisma.UserWhereInput[] = []
    if ("user".includes(search)) {
      roleFilter.push({ role: "USER" })
    }
    if ("moderator".includes(search)) {
      roleFilter.push({ role: "MODERATOR" })
    }
    if ("administrator".includes(search)) {
      roleFilter.push({ role: "ADMIN" })
    }

    whereClause = {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        ...roleFilter,
      ],
    }
  }

  const total = await prisma.user.count({ where: whereClause })
  const pageMeta = getPageMeta(event, total)

  const result = await prisma.user.findMany({
    ...getPaginationPrismaParam(pageMeta),
    where: whereClause,
  })

  return {
    items: result as UserDetail[],
    pagination: pageMeta,
  } as Page<UserDetailAdmin>
})

defineRouteMeta({
  openAPI: {
    description: "Get a list of users",
    tags: ["User"],
    responses: {
      200: {
        description: "A list of users",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  name: { type: "string" },
                  role: { type: "string" },
                  verified: { type: "string", enum: ["User", "Moderator", "Administrator"] },
                  email: { type: "string", format: "email" },
                },
              },
            },
          },
        },
      },
    },
  },
})
