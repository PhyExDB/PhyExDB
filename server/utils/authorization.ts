import type { H3Event, EventHandlerRequest } from "h3"

/* eslint-disable @typescript-eslint/no-explicit-any */

type AbillityFunc<T extends any[]> = (user: UserDetail, ...param: T) => boolean
type Abillity<T extends any[]> = { func: AbillityFunc<T>, allowGuests: boolean }
type UserAbillity<T extends any[]> = { func: AbillityFunc<T>, allowGuests: false }

/**
 * Authorizes a user based on the provided ability and parameters.
 */
export async function authorize<T extends any[]>(
  event: H3Event<EventHandlerRequest>,
  abillity: Abillity<T>,
  ...param: T
): Promise<UserDetail | null> {
  const user = await getUser(event)
  if (!user) {
    if (abillity.allowGuests) {
      return null
    } else {
      throw createError({ statusCode: 401, statusMessage: "Not logged in" })
    }
  }
  const isAuthorized = abillity.func(user, ...param)
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
  abillity: UserAbillity<T>,
  ...param: T
): Promise<UserDetail> {
  const user = await getUserOrThrowError(event)
  const isAuthorized = abillity.func(user, ...param)
  if (!isAuthorized) {
    throw createError({ statusCode: 403, statusMessage: "Not authorized" })
  }
  return user
}
/**
 * Defines an ability.
 */
export function defineAbillity<T extends any[], B extends boolean>(allowGuests: B, func: AbillityFunc<T>) {
  return { func, allowGuests }
}
