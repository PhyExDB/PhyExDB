import { userAbilities } from "~~/shared/utils/abilities"
import { authorize } from "~~/server/utils/authorization"
import type { UserDetailAdmin } from "~~/shared/types"

export default defineEventHandler(async (event) => {
  await authorize(event, userAbilities.getAll)

  const whereClause = {}

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
