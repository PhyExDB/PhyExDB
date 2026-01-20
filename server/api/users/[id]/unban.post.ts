import { authorize } from "~~/server/utils/authorization"
import { userAbilities } from "~~/shared/utils/abilities"
import { getIdPrismaWhereClause } from "~~/server/utils/prisma"

/**
 * POST /api/users/:id/unban
 *
 * Lifts a user's ban by setting `banned = false`
 */
export default defineEventHandler(async (event) => {
  // Admins only
  await authorize(event, userAbilities.put)

  const where = getIdPrismaWhereClause(event)

  const target = await prisma.user.findUnique({ where })
  if (!target) {
    throw createError({ status: 404, message: "User not found" })
  }

  // Guard: already unbanned
  if (!target.banned) {
    return {
      id: target.id,
      banned: false,
    }
  }

  const updated = await prisma.user.update({
    where,
    data: { banned: false },
  })

  return {
    id: updated.id,
    banned: false,
  }
})
