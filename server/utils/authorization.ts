import type { H3Event, EventHandlerRequest } from "h3"
import type { Ability, UserAbility } from "~~/shared/utils/auth"

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Authorizes a user based on the provided ability and parameters.
 */
export async function authorize<T extends any[]>(
  event: H3Event<EventHandlerRequest>,
  ability: Ability<T>,
  ...param: T
): Promise<UserDetail | null> {
  const user = await getUser(event)
  if (!user) {
    if (ability.allowGuests) {
      return null
    } else {
      throw createError({ statusCode: 401, statusMessage: "Not logged in" })
    }
  }
  const isAuthorized = ability.func(user, ...param)
  if (!isAuthorized) {
    throw createError({ statusCode: 403, statusMessage: "Not authorized" })
  }
  return user
}
/**
 * Authorizes a user based on the provided UserAbility and parameters.
 * Can't be used with abillities allowing guests to prevent the strengthening of requirements.
 */
export async function authorizeUser<T extends any[]>(
  event: H3Event<EventHandlerRequest>,
  ability: UserAbility<T>,
  ...param: T
): Promise<UserDetail> {
  const user = await getUserOrThrowError(event)
  const isAuthorized = ability.func(user, ...param)
  if (!isAuthorized) {
    throw createError({ statusCode: 403, statusMessage: "Not authorized" })
  }
  return user
}
