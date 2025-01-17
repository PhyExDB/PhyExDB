/* eslint-disable @typescript-eslint/no-explicit-any */
import type { H3Event, EventHandlerRequest } from "h3"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import prisma from "../../server/utils/prisma"

/**
 * betterAuth config
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, _) => {
      const devUrl = url.replace("http://localhost", "http://localhost:3000")
      authLogger.alert("signupEmail", { user, devUrl, token })
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, newEmail, url, token }, _) => {
        const devUrl = url.replace("http://localhost", "http://localhost:3000")
        authLogger.alert("changeEmail", { user, newEmail, devUrl, token })
      },
    },
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "USER",
        input: false, // don't allow user to set role
      },
    },
  },
})

/**
 * getUserDetail()
 */
export async function getUser(event: H3Event<EventHandlerRequest>): Promise<UserDetail | null> {
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  return sessionToUserDetail(session)
}

/**
 * getUserDetailOrThrowError()
 */
export async function getUserOrThrowError(event: H3Event<EventHandlerRequest>): Promise<UserDetail> {
  const user = await getUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Not logged in" })
  }
  return user
}

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
 * Authorizes a user based on the provided UserAbility and parameters. Can't be used with abillities to prevent the strengthening of requirements.
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
export function defineAbillity<T extends any[]>(allowGuests: boolean, func: AbillityFunc<T>): Abillity<T> {
  return { func, allowGuests }
}
/**
 * Defines an userAbility.
 */
export function defineUserAbillity<T extends any[]>(func: AbillityFunc<T>): UserAbillity<T> {
  return { func, allowGuests: false }
}
