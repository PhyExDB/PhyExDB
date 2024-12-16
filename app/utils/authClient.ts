import { inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/vue"
import { toRef } from "vue"

/**
 * authClient
 */
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
})

/**
 * getUser
 */
export async function useUser() {
  const { data: session } = await authClient.useSession(useFetch)
  const user = toRef(() => sessionToUserDetail(session?.value))
  return user
}
