import { authorize } from "~~/server/utils/authorization"
import { userAbilities } from "~~/shared/utils/abilities"
import { getIdPrismaWhereClause } from "~~/server/utils/prisma"

/**
 * POST /api/users/:id/ban
 *
 * Secure backend endpont for banning a user
 *
 * Bans a user by setting `banned = true`
 * Executed with admin privileges
 */
export default defineEventHandler(async (event) => {
  // Admins only
  await authorize(event, userAbilities.put)

  const where = getIdPrismaWhereClause(event)

  const target = await prisma.user.findUnique({ where })
  if (!target) {
    throw createError({ status: 404, message: "User not found" })
  }

  // Guard: already banned
  if (target.banned) {
    return {
      id: target.id,
      banned: true,
    }
  }

  const updated = await prisma.user.update({
    where,
    data: { banned: true },
  })

  return {
    id: updated.id,
    banned: true,
  }
})
