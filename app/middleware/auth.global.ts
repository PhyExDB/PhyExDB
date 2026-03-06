export default defineNuxtRouteMiddleware(async (to) => {
  const EXEMPT_ROUTES = ["/login", "/register", "/2fa/setup", "/2fa/challenge"]

  if (EXEMPT_ROUTES.some(path => to.path.startsWith(path))) return

  try {
    const status = await $fetch('/api/2fa/status', {
      params: { t: Date.now() }
    })

    if (!status.authenticated) {
      return navigateTo('/login')
    }

    if (status.setupRequired) {
      return navigateTo('/2fa/setup')
    }

    if (status.enabled && status.required) {
      return navigateTo(`/2fa/challenge?redirect=${encodeURIComponent(to.fullPath)}`)
    }

  } catch (error) {
    console.error("Middleware Auth Error:", error)
    return navigateTo('/login')
  }
})
