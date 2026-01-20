import { authorize } from "~~/server/utils/authorization"
import { userAbilities } from "~~/shared/utils/abilities"
import { getIdPrismaWhereClause } from "~~/server/utils/prisma"

/**
 * DELTE /api/users/:id
 *
 * Secure backend endpoint for deleting a user
 *
 * Authozation is enforced sever-side and executed with admin rights
 */
export default defineEventHandler(async (event) => {
  // Admins only
  await authorize(event, userAbilities.delete)

  const where = getIdPrismaWhereClause(event)

  // Load target user
  const target = await prisma.user.findUnique({ where })
  if (!target) {
    throw createError({ status: 404, message: "User not found" })
  }

  // Guard: prevent deleting the last remaining admin
  if (target.role === "ADMIN") {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    })

    if (adminCount === 1) {
      throw createError({
        status: 400,
        message: "Cannot delete the last admin user",
      })
    }
  }

  // Perform deletion
  await prisma.user.delete({ where })

  return {
    id: target.id,
    deleted: true,
  }
})
