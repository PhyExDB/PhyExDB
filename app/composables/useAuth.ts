import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/vue"

/**
 * Auth client instance configured with plugins.
 */
export const useAuth = () => {
  const url = useRequestURL()
  const client = createAuthClient({
    plugins: [adminClient()],
    baseURL: url.origin,
  })

  const session = client.useSession(useFetch)

  return { client, session }
}
