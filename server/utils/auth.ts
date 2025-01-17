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
