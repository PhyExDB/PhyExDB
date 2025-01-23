/**
 * Utillity function to convert a session to a user detail
 */
export function sessionToUserDetail(session: typeof auth.$Infer.Session | null | undefined): UserDetail | null {
  if (!session) {
    return null
  }
  if (!(session.user.role === "ADMIN" || session.user.role === "MODERATOR" || session.user.role === "USER")) {
    return null
  }
  const user: UserDetail = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    emailVerified: session.user.emailVerified,
  }
  return user
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
 * Type of the function in an abillity.
 */
export type AbilityFunc<T extends any[]> = (user: UserDetail, ...param: T) => boolean
/**
 * Type of an abillity.
 */
export type Ability<T extends any[]> = { func: AbilityFunc<T>, allowGuests: boolean | false }
/**
 * Type of an abillity not allowingGuests.
 */
export type UserAbility<T extends any[]> = { func: AbilityFunc<T>, allowGuests: false }

/**
 * Evaluates the ability of a user to perform a certain action.
 */
export function evaluateAbility<T extends any[]>(
  user: UserDetail | null,
  ability: Ability<T>,
  ...param: T
): UserDetail | null | "Not authorized" | "Not logged in" {
  if (!user) {
    if (ability.allowGuests) {
      return null
    } else {
      return "Not logged in"
    }
  }
  const isAuthorized = ability.func(user, ...param)
  if (!isAuthorized) {
    return "Not authorized"
  }
  return user
}

/**
 * Evaluates the ability of a user to perform a certain action.
 */
export function evaluateUserAbility<T extends any[]>(
  user: UserDetail,
  ability: UserAbility<T>,
  ...param: T
): UserDetail | "Not authorized" {
  const isAuthorized = ability.func(user, ...param)
  if (!isAuthorized) {
    return "Not authorized"
  }
  return user
}

/**
 * Defines an ability.
 */
export function defineAbility<T extends any[], B extends boolean>(allowGuests: B, func: AbilityFunc<T>) {
  return { func, allowGuests }
}
/**
 * Defines an ability.
 */
export function defineAbilityNoGuests<T extends any[]>(func: AbilityFunc<T>): UserAbility<T> {
  return { func, allowGuests: false }
}
/**
 * Defines an ability.
 */
export function defineAbilityAllowingGuests<T extends any[]>(func: AbilityFunc<T>): Ability<T> {
  return { func, allowGuests: true }
}
/**
 * Maps the function of an ability.
 */
export function abilityMapFunction<T extends any[], S extends any[]>(
  ability: Ability<T>,
  f: (f: AbilityFunc<T>) => AbilityFunc<S>,
) {
  return { ...ability, func: f(ability.func) } satisfies Ability<S>
}
