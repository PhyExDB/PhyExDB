import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/vue"
import { toRef } from "vue"

const url = process.env.API_URL // { origin: "http://localhost:3000" } // useRequestURL().origin

/**
 * Auth client instance configured with plugins.
 */
export const authClient = createAuthClient({
  plugins: [adminClient()],
  baseURL: url,
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
