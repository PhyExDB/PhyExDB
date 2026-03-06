export default defineNuxtRouteMiddleware(async (to) => {
  const EXEMPT_ROUTES = [
    "/login",
    "/register",
    "/2fa/setup",
    "/2fa/challenge",
  ]

  if (EXEMPT_ROUTES.some(path => to.path.startsWith(path))) {
    return
  }

  try {
    const status = await $fetch("/api/2fa/status")

    if (status.setupRequired) {
      if (to.path !== "/2fa/setup") {
        return navigateTo("/2fa/setup")
      }
      return
    }

    if (status.enabled && status.required) {
      if (to.path !== "/2fa/challenge") {
        return navigateTo(`/2fa/challenge?redirect=${encodeURIComponent(to.fullPath)}`)
      }
      return
    }
  } catch (error) {
    console.error("Auth-Check fehlgeschlagen:", error)
    return navigateTo("/login")
  }
})
