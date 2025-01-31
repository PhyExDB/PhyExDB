import { toRef } from "vue"

/**
 * Hook to get the current user session.
 *
 * @returns {Promise<Ref<UserDetail | null>>} A reference to the user details derived from the session.
 */
export async function useUser(): Promise<Ref<UserDetail | null>> {
  const { data: session } = await useAuth().session
  const user = toRef(() => {
    return sessionToUserDetail(session?.value)
  })
  return user
}

/**
 * Hook to get the current user session.
 */
export async function useUserOrThrowError(): Promise<Ref<UserDetail>> {
  const user = await useUser()
  return computed(() => {
    if (user.value == null) {
      navigateToWithRedirect("/login")
      throw createError({ statusCode: 401, statusMessage: "Not logged in" })
    }
    return user.value
  })
}

/**
 * Hook to get the current user session.
 */
export async function getUser(): Promise<UserDetail | null> {
  return (await useUser()).value
}
