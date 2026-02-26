import { UserRole } from "@prisma/client"

/**
 * Holt alle IDs von Moderatoren und Admins
 */
export async function getModeratorIds(excludeId?: string | null): Promise<string[]> {
  const moderators = await prisma.user.findMany({
    where: {
      role: { in: [UserRole.MODERATOR, UserRole.ADMIN] },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  })

  return (moderators || []).map(m => m.id)
}
