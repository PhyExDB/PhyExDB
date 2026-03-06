/**
 * Determines the navigation target based on the 2FA status.
 * @param status The current TwoFactorStatus
 * @param currentPath The current path (to prevent infinite loops)
 * @returns The target path string or null if no action is required
 */
export function getTwoFaRedirectTarget(
  status: TwoFactorStatus,
  currentPath: string = "",
): string | null {
  if (!status.authenticated) {
    return "/login"
  }

  if (!status.enabled) {
    if (currentPath.startsWith("/2fa/setup")) return null
    return "/2fa/setup"
  }

  if (!status.verified) {
    if (currentPath.startsWith("/2fa/challenge")) return null
    const redirectParam = currentPath && currentPath !== "/"
      ? `?redirect=${encodeURIComponent(currentPath)}`
      : ""
    return `/2fa/challenge${redirectParam}`
  }

  return null
}

export const use2fa = () => {
  const status = useState<TwoFactorStatus | null>("2fa-status", () => null)
  const loading = ref(false)

  const refreshStatus = async () => {
    const data = await $fetch<TwoFactorStatus>("/api/2fa/status", {
      params: { t: Date.now() },
    })
    status.value = data
    return data
  }

  return { status, loading, refreshStatus }
}
