import { toRef } from "vue"

/**
 * getUser
 */
export async function useUser() {
  const { data: session } = await authClient.useSession(useFetch)
  const user = toRef(() => session.value?.user)
  return user
}
