import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/vue"

/**
 * Auth client instance configured with plugins.
 */
export const useAuth = () => {
  // const url = useRequestURL()
  return createAuthClient({
    plugins: [adminClient()],
    // baseURL: url.origin,
  })
}
