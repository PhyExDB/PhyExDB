import type { TwoFactorStatus } from "#shared/types/TwoFa.type"

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

    if (!status.authenticated) {
      return navigateTo("/login")
    }

    if (!status.enabled) {
      return navigateTo("/2fa/setup")
    }

    if (!status.verified) {
      return navigateTo(`/2fa/challenge?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  } catch {
    return navigateTo("/login")
  }
})
