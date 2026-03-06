export default defineNuxtRouteMiddleware(async (to) => {
  const EXEMPT_ROUTES = ["/login", "/register", "/2fa/setup", "/2fa/challenge"]

  if (
    to.path.startsWith('/api') ||
    to.path.startsWith('/_') ||
    EXEMPT_ROUTES.some(path => to.path.startsWith(path))
  ) return

  try {
    const status = await $fetch('/api/2fa/status', {
      params: { t: Date.now() },
      headers: useRequestHeaders(['cookie']) as any
    })

    if (!status.authenticated) return navigateTo('/login')

    // 1. Muss der User 2FA erst einrichten?
    if (status.setupRequired) {
      return navigateTo('/2fa/setup')
    }

    // 2. Hat der User 2FA aktiv, aber noch nicht bestätigt?
    if (status.enabled && status.required) {
      return navigateTo(`/2fa/challenge?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  } catch {
    return navigateTo('/login')
  }
})
