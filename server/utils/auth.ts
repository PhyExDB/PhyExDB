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
  user: {
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
 * useUserDetail()
 */
export async function useUser(event: H3Event<EventHandlerRequest>) {
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  return sessionToUserDetail(session)
}
