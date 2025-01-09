/**
 * Utillity function to convert a session to a user detail
 */
export function sessionToUserDetail(session: typeof auth.$Infer.Session | null | undefined): UserDetail | null {
  if (!session) {
    return null
  }
  if (!(session.user.role === "ADMIN" || session.user.role === "MODERATOR" || session.user.role === "USER")) {
    return null
  }

  const role: UserRole = UserRole[session.user.role as keyof typeof UserRole]

  const user: UserDetail = {
    id: session.user.id,
    username: session.user.name,
    email: session.user.email,
    role: role,
    emailVerified: session.user.emailVerified,
  }
  return user
}

/**
 * Type of errors thrown by betterAuthClient
 */
export type ErrorType = {
  code?: string | undefined
  message?: string | undefined
  status: number
  statusText: string
} | null
