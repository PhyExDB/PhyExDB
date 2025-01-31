/**
 * Follows a redirect to a specified path or defaults to the "/profile" path.
 *
 * This function retrieves the `redirect` query parameter from the current route.
 * If the `redirect` parameter is not present, it defaults to "/profile".
 * It then navigates to the specified path.
 */
export function followRedirect() {
  const path = useRoute().query.redirect as string || "/profile"
  navigateTo(path)
}

/**
 * Navigates to the specified path while preserving the current route as a redirect query parameter.
 */
export function navigateToWithRedirect(path: string) {
  navigateTo({ path, query: { redirect: useRoute().fullPath } })
}
