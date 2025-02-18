import type { Event } from "./utils"
import { getUser, getUserOrThrowError } from "./auth"
import type { Ability, UserAbility } from "~~/shared/utils/auth"
import { evaluateAbility, evaluateUserAbility } from "~~/shared/utils/auth"

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Authorizes a user based on the provided ability and parameters.
 */
export async function authorize<T extends any[]>(
  event: Event,
  ability: Ability<T>,
  ...param: T
): Promise<UserDetail | null> {
  const result = evaluateAbility(await getUser(event), ability, ...param)
  if (result === "Not logged in") {
    throw createError({ statusCode: 401, statusMessage: "Not logged in" })
  } else if (result === "Not authorized") {
    throw createError({ statusCode: 403, statusMessage: "Not authorized" })
  }
  return result
}
/**
 * Authorizes a user based on the provided UserAbility and parameters.
 * Can't be used with abillities allowing guests to prevent the strengthening of requirements.
 */
export async function authorizeUser<T extends any[]>(
  event: Event,
  ability: UserAbility<T>,
  ...param: T
): Promise<UserDetail> {
  const result = evaluateUserAbility(await getUserOrThrowError(event), ability, ...param)
  if (result === "Not authorized") {
    throw createError({ statusCode: 403, statusMessage: "Not authorized" })
  }
  return result
}
