import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/vue"

/**
 * Auth client instance configured with plugins.
 */
const client = createAuthClient({
  plugins: [adminClient()],
  baseURL: useRequestURL().origin,
})

export const useAuth = () => {
  const session = client.useSession(useFetch)
  return { session, client }
}
