/**
 * Paths that exist only for authentication/2FA purposes and should never be
 * used as a post-auth redirect target.
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
  const status = useState<TwoFactorStatus | null>("2fa-status", () => ({
    authenticated: false,
    enabled: false,
    verified: false,
    required: false,
  }))

  const refreshStatus = async () => {
    const data = await $fetch<TwoFactorStatus>("/api/2fa/status", {
      params: { t: Date.now() },
    })
    status.value = data
    return data
  }

  const performAction = async (endpoint: string, code?: string) => {
    const res = await $fetch<{ recoveryCodes?: string[] }>(`/api/2fa/${endpoint}`, {
      method: "POST",
      body: code ? { code } : undefined,
    })
    await refreshStatus()
    return res
  }

  const logout = async () => {
    await $fetch("/api/auth/logout", { method: "POST" })
    clearNuxtData()
    return navigateTo("/login")
  }

  const setVerified = () => {
    if (!status.value) {
      status.value = { authenticated: true, enabled: false, verified: true }
    } else {
      status.value = { ...status.value, verified: true, authenticated: true }
    }
  }

  return {
    status,
    refreshStatus,
    logout,
    setup: () => $fetch<{ qrDataUrl: string, secret: string }>("/api/2fa/setup"),
    enable: (code: string) => performAction("enable", code),
    disable: (code: string) => performAction("disable", code),
    regenerateRecoveries: (code: string) => performAction("recoveries", code),
    setVerified,
    isVerified: computed(() => status.value?.verified ?? false),
  }
}
