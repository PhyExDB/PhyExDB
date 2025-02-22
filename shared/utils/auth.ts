/**
 * Utillity function to convert a session to a user detail
 */
export function sessionToUserDetail(
  session: Pick<typeof auth.$Infer.Session, "user"> | null | undefined,
): UserDetail | null {
  return session?.user as UserDetail | null
}

/**
 * Type of errors thrown by betteruseAuth().client
 */
export type ErrorType = {
  code?: string | undefined
  message?: string | undefined
  status: number
  statusText: string
} | null

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Type of an abillity.
 */
export type Ability<T extends any[]> = (user: UserDetail | null, ...param: T) => boolean
/**
 * Type of an user abillity.
 */
export type UserAbility<T extends any[]> = Ability<T>

/**
 * Evaluates the ability of a user to perform a certain action.
 */
export function evaluateAbility<T extends any[]>(
  user: UserDetail | null,
  ability: Ability<T>,
  ...param: T
): UserDetail | null | "Not authorized" | "Not logged in" {
  if(user === undefined){
    user = null
  }
  const isAuthorized = ability(user, ...param)
  if (!isAuthorized) {
    return user === null ? "Not logged in" : "Not authorized"
  }
  return user
}

/**
 * Evaluates the ability of a user to perform a certain action.
 */
export function evaluateUserAbility<T extends any[]>(
  user: UserDetail,
  ability: Ability<T>,
  ...param: T
): UserDetail | "Not authorized" {
  if(user !== undefined){
    const isAuthorized = ability(user, ...param)
    if (!isAuthorized) {
      return "Not authorized"
    }
  }
  return user
}

/**
 * Defines an ability.
 */
export function defineAbility<T extends any[]>(ability: Ability<T>): Ability<T> {
  return ability
}
/**
 * Defines an ability.
 */
export function defineAbilityNoGuests<T extends any[]>(
  func: (user: UserDetail, ...param: T) => boolean,
): Ability<T> {
  return (user, ...param) => user !== null && func(user, ...param)
}
