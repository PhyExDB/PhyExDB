import { toRef } from "vue"

// singleton
let user: Ref<UserDetail | null> | undefined = undefined
let impersonatedBy: Ref<string | null | undefined> | undefined = undefined

async function init(){
  // const { data: session } = await useAuth().client.useSession(useFetch)
  const { data: session } = await useAuth().session

  user = toRef(() => {
    return sessionToUserDetail(session?.value)
  })
  impersonatedBy = toRef(() => {
    return session?.value?.session.impersonatedBy
  })
  return { user, impersonatedBy }
}

/**
 * Hook to get the current user session.
 */
export async function useUser(): Promise<Ref<UserDetail | null>> {
  if(user === undefined) {
    return (await init()).user
  }
  return user
}

/**
 * Hook to get the current user session.
 */
export async function useImpersonatedBy(): Promise<Ref<string | null | undefined>> {
  if(impersonatedBy === undefined) {
    return (await init()).impersonatedBy
  }
  return impersonatedBy
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
