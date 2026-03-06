export default defineNuxtRouteMiddleware(async (to) => {
  const EXEMPT_ROUTES = ["/login", "/register", "/2fa/setup", "/2fa/challenge"]

  if (
    to.path.startsWith("/api")
    || to.path.startsWith("/_")
    || EXEMPT_ROUTES.some(path => to.path === path || to.path.startsWith(path + "/"))
  ) return

  try {
    const status = await $fetch<TwoFactorStatus>("/api/2fa/status", {
      params: { t: Date.now() },
      headers: useRequestHeaders(["cookie"]),
    })

    const target = getTwoFaRedirectTarget(status, to.fullPath)
    if (target) return navigateTo(target)

  } catch {
    return navigateTo("/login")
  }
})
