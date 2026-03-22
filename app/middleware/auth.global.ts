export default defineNuxtRouteMiddleware(async (to) => {
  if (
    to.path.startsWith("/api")
    || to.path.startsWith("/_")
    || AUTH_ONLY_PATHS.some(path => to.path === path || to.path.startsWith(path + "/"))
    || to.path.startsWith("/legal")
  ) return

  const statusState = useState<TwoFactorStatus | null>("2fa-status", () => null)

  try {
    const status = await $fetch<TwoFactorStatus>("/api/2fa/status", {
      params: { t: Date.now() },
      headers: useRequestHeaders(["cookie"]),
    })

    statusState.value = status

    if (status.authenticated) {
      const target = getTwoFaRedirectTarget(status, to.fullPath)
      if (target) return navigateTo(target)
    }
  } catch {
    statusState.value = null
  }
})
