/**
 * Follows a redirect to a specified path or defaults to the "/profile" path.
 *
 * This function retrieves the `redirect` query parameter from the current route.
 * If the `redirect` parameter is not present, it defaults to "/profile".
 * It then navigates to the specified path.
 */
export async function followRedirect(status?: TwoFactorStatus | null) {
  const route = useRoute()

  if (status) {
    const twoFaTarget = getTwoFaRedirectTarget(status, route.fullPath)
    if (twoFaTarget) {
      return navigateTo(twoFaTarget)
    }
  }

  const rawPath = route.query.redirect?.toString() || "/profile"

  const safePath = sanitizeRedirect(rawPath)

  return navigateTo(safePath, { replace: true })
}

/**
 * Navigates to the specified path while preserving the current route as a redirect query parameter.
 */
export async function navigateToWithRedirect(targetPath: string) {
  const route = useRoute()

  if (route.path === targetPath) return

  return navigateTo({
    path: targetPath,
    query: { redirect: route.fullPath },
  })
}
