import type { UserRole } from "@prisma/client"

/**
 * Checks if a given role is at least a moderator.
 *
 * @param role the role to check
 * @returns true if the role is Moderator or Administrator, false otherwise
 */
export function minModerator(role: UserRole): boolean {
  return role === "MODERATOR" || role === "ADMIN"
}
