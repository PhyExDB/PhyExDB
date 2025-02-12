import type { H3Event, EventHandlerRequest } from "h3"
import { betterAuth } from "better-auth"
import { APIError } from "better-auth/api"
import { admin } from "better-auth/plugins"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { render } from "@vue-email/render"
import prisma from "../lib/prisma"
import verifyEmail from "./emailTemplates/reset-password-email.vue"

/**
 * betterAuth config
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  trustedOrigins: useRuntimeConfig().trustedOrigins.split(","),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }, _) => {
      await useNodeMailer().sendMail({
        to: user.email,
        subject: "Setze dein PhyExDB Passwort zurück",
        text: `Klicke auf den folgenden Link um dein Passwort zurückzusetzen: ${url}`,
        html: await render(verifyEmail, {
          url,
          appName: "PhyExDB" }, {
          pretty: true,
        }),
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }, _) => {
      const _runtimeConfig = useRuntimeConfig()
      await useNodeMailer().sendMail({
        subject: "Verifying PHYEXDB email-address",
        text: `Bitte klicke auf den folgenden Link um deinen PhyExDB Account zu verifizieren: ${url}.`,
        to: user.email,
        html: ``,
      })
    },
  },
  user: {
    deleteUser: {
      enabled: true,
      beforeDelete: async (user, _) => {
        // There should at least be one admin user in the database
        const adminUsers = await prisma.user.count({ where: { role: "ADMIN" } })
        const userRecord = await prisma.user.findUnique({ where: { id: user.id } })
        const userRole = userRecord?.role
        if (adminUsers === 1 && userRole === "ADMIN") {
          throw new APIError("BAD_REQUEST", { message: "Cannot delete the last admin user" })
        }
      },
      // Cleanup user data after deletion in betterAuth table. Referential fields are set to null as definded in schema.prisma
      afterDelete: async (user, _) => {
        prisma.user.delete({ where: { id: user.id } })
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, newEmail, url, token }, _) => {
        const devUrl = url.replace("http://localhost", "http://localhost:3000")
        authLogger.alert("cha^ngeEmail", { user, newEmail, devUrl, token })
      },
    },
  },
  plugins: [
    admin({
      defaultRole: "USER",
      adminRole: ["ADMIN"],
    }),
  ],
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
