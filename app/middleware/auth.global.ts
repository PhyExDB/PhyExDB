export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const EXEMPT_ROUTES = ["/login", "/register", "/2fa/setup", "/2fa/challenge"]

  if (
    to.path.startsWith("/api")
    || to.path.startsWith("/_")
    || EXEMPT_ROUTES.some(path => to.path === path || to.path.startsWith(path + "/"))
  ) return

  const statusState = useState<TwoFactorStatus | null>("2fa-status", () => null)

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
    return navigateTo("/login")
  }
})
