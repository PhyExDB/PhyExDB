import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/vue"

type Client = ReturnType<typeof createAuthClient<{
  plugins: [ReturnType<typeof adminClient>],
  baseURL: string
}>>

let auth: {
  client: Client,
  session: ReturnType<Client["useSession"]>
}

/**
 * Auth client instance configured with plugins.
 */
export const useAuth = () => {
  if(!auth){
    const url = useRequestURL()
    const client = createAuthClient({
      plugins: [adminClient()],
      baseURL: url.origin,
    })

    const session = client.useSession(useFetch)

    auth = { client, session }
    // return { client, session }
  }
  return auth
}
