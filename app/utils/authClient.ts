import { inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/vue"
import { toRef } from "vue"

/**
 * Auth client instance configured with plugins.
 *
 * @type {ReturnType<typeof createAuthClient>}
 */
export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
})

/**
 * Hook to get the current user session.
 *
 * @returns {Promise<Ref<UserDetail | null>>} A reference to the user details derived from the session.
 */
export async function useUser(): Promise<Ref<UserDetail | null>> {
  const { data: session } = await authClient.useSession(useFetch)
  const user = toRef(() => {
    return sessionToUserDetail(session?.value)
  })
  return user
}
