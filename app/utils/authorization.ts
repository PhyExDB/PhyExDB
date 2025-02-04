import { useUser } from "./auth"
import type { Ability, UserAbility } from "~~/shared/utils/auth"
import { evaluateAbility } from "~~/shared/utils/auth"

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Redirect if not logged in or not authorized.
 */
export async function authorize<T extends any[]>(
  ability: Ability<T>,
  ...param: T
): Promise<Ref<UserDetail | null>> {
  const user = await useUser()
  const func = async () => {
    const result = evaluateAbility(user.value, ability, ...param)
    if (result === "Not logged in") {
      navigateToWithRedirect("/login")
      throw createError({ statusCode: 401, statusMessage: "Not logged in" })
    } else if (result === "Not authorized") {
      throw showError({ statusCode: 403, statusMessage: "Not authorized" })
    }
  }
  watch(user, func)
  func()
  return useUser()
}
/**
 * Authorizes a user based on the provided UserAbility and parameters.
 * Can't be used with abillities allowing guests to prevent the strengthening of requirements.
 */
export async function authorizeUser<T extends any[]>(
  ability: UserAbility<T>,
  ...param: T
): Promise<Ref<UserDetail>> {
  await authorize(ability, ...param)
  return useUserOrThrowError()
}

/**
 * Check if the user is allowed to perform a certain action.
 */
export async function allows<T extends any[]>(
  ability: Ability<T>,
  ...param: T
): Promise<Ref<boolean>> {
  const user = await useUser()
  const result = toRef(() => {
    const result = evaluateAbility(user.value, ability, ...param)
    return !(result === "Not logged in" || result === "Not authorized")
  })
  return result
}
/**
 * Check if the user is denied to perform a certain action.
 */
export async function denies<T extends any[]>(
  ability: Ability<T>,
  ...param: T
): Promise<Ref<boolean>> {
  const user = await useUser()
  const result = toRef(() => {
    const result = evaluateAbility(user.value, ability, ...param)
    return (result === "Not logged in" || result === "Not authorized")
  })
  return result
}
