import type { UserRole } from "~~/shared/types/User.type"
import type { authClient } from "~~/app/utils/authClient"

/**
 * Checks if a given role is at least a moderator.
 *
 * @param role the role to check
 * @returns true if the role is Moderator or Administrator, false otherwise
 */
export function minModerator(role: UserRole): boolean {
  return role === "MODERATOR" || role === "ADMIN"
}

/**
 * Utillity function to convert a session to a user detail
 */
export function sessionToUserDetail(session: typeof authClient.$Infer.Session | null | undefined): UserDetail | null {
  if (!session) {
    return null
  }
  if (!(session.user.role === "ADMIN" || session.user.role === "MODERATOR" || session.user.role === "USER")) {
    return null
  }
  const user: UserDetail = {
    id: session.user.id,
    username: session.user.name,
    email: session.user.email,
    role: session.user.role,
    emailVerified: session.user.emailVerified,
  }
  return user
}
