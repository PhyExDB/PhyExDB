import { inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/vue"
import { toRef } from "vue"
import type { auth } from "~~/server/utils/auth"

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

function redirectNotLoggedInUserWatcher() {
  watchEffect(async () => {
    const user = await useUser()
    if (user.value === null) {
      await navigateTo("/login")
    }
  })
}

/**
 * Hook to get the current user session.
 */
export async function useUserOrThrowError(): Promise<Ref<UserDetail>> {
  redirectNotLoggedInUserWatcher()
  const user = await useUser()
  return toRef(() => {
    if (user.value === null) {
      throw createError({ statusCode: 401, statusMessage: "Not logged in" })
    }
    return user.value
  })
}

/**
 * Hook to get the current user session.
 */
export async function getUser(): Promise<UserDetail | null> {
  const { data: session } = await authClient.useSession(useFetch)
  return sessionToUserDetail(session?.value)
}
