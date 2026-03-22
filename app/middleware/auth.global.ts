export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  if (
    to.path.startsWith("/api")
    || to.path.startsWith("/_")
    || AUTH_ONLY_PATHS.some(path => to.path === path || to.path.startsWith(path + "/"))
    || to.path.startsWith("/legal")
  ) return

  const statusState = useState<TwoFactorStatus | null>("2fa-status", () => null)

  // If we already know the user is fully verified (e.g. we just set this locally
  // after completing the 2FA challenge), skip the network call
  if (
    statusState.value?.authenticated
    && statusState.value?.enabled
    && statusState.value?.verified
  ) return

  try {
    const status = await $fetch<TwoFactorStatus>("/api/2fa/status", {
      params: { t: Date.now() },
      headers: useRequestHeaders(["cookie"]),
    })

    statusState.value = status

    const target = getTwoFaRedirectTarget(status, to.fullPath)
    if (target) return navigateTo(target)
  } catch {
    statusState.value = null
  }
})
