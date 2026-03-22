/**
 * Paths that exist only for authentication/2FA purposes and should never be
 * used as a post-auth redirect target. Defined once here and reused everywhere.
 */
export const AUTH_ONLY_PATHS = [
  "/login",
  "/register",
  "/2fa/challenge",
  "/2fa/setup",
]

/**
 * Sanitizes a redirect path so we never send users back to an auth-only page
 * after they complete login / 2FA.
 *
 * e.g. sanitizeRedirect("/login") → "/profile"
 *      sanitizeRedirect("/experiments") → "/experiments"
 */
export function sanitizeRedirect(path: string | null | undefined, fallback = "/profile"): string {
  if (!path) return fallback
  const isAuthOnly = AUTH_ONLY_PATHS.some(p => path === p || path.startsWith(p + "/"))
  return isAuthOnly ? fallback : path
}

/**
 * Determines the navigation target based on the 2FA status.
 * Only redirects authenticated users — guests can browse freely.
 */
export function getTwoFaRedirectTarget(
  status: TwoFactorStatus,
  currentPath: string = "",
): string | null {
  if (!status.authenticated) return null

  if (!status.enabled) {
    if (currentPath.startsWith("/2fa/setup")) return null
    return "/2fa/setup"
  }

  if (!status.verified) {
    if (currentPath.startsWith("/2fa/challenge")) return null
    // Sanitize so we never store an auth-only page as the redirect target
    const safeRedirect = sanitizeRedirect(currentPath)
    const redirectParam = safeRedirect !== "/profile"
      ? `?redirect=${encodeURIComponent(safeRedirect)}`
      : ""
    return `/2fa/challenge${redirectParam}`
  }

  return null
}

export const use2fa = () => {
  const status = useState<TwoFactorStatus | null>("2fa-status", () => null)

  const refreshStatus = async () => {
    try {
      const data = await $fetch<TwoFactorStatus>("/api/2fa/status", {
        params: { t: Date.now() },
      })
      status.value = data
      return data
    } catch {
      status.value = null
      return null
    }
  }

  const setVerified = () => {
    if (status.value) {
      status.value = { ...status.value, verified: true, authenticated: true }
    }
  }

  const logout = async () => {
    await $fetch("/api/auth/logout", { method: "POST" })
    status.value = null
    clearNuxtData()
    await navigateTo("/login")
  }

  return {
    status,
    refreshStatus,
    setVerified,
    logout,
  }
}
