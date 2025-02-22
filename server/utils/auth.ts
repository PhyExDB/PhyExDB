import { betterAuth } from "better-auth"
import { APIError } from "better-auth/api"
import { admin } from "better-auth/plugins"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { render } from "@vue-email/render"
import prisma from "../lib/prisma"
import type { Event } from "./utils"
import verifyAccountEmail from "./emailTemplates/verifyAccountEmail.vue"
import resetPasswordEmail from "./emailTemplates/resetPasswordEmail.vue"
import UpdatedEmailVerificationTemplate from "./emailTemplates/updatedEmailVerificationTemplate.vue"

/**
 * betterAuth config
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  trustedOrigins: useRuntimeConfig().trustedOrigins.split(","),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }, _) => {
      const runtimeConfig = useRuntimeConfig()
      await useNodeMailer().sendMail({
        to: user.email,
        subject: `Setze dein ${runtimeConfig.appName} Passwort zurück`,
        text: await render(resetPasswordEmail, {
          url,
          appName: runtimeConfig.appName,
          username: user.name,
        }, {
          plainText: true,
        }),
        html: await render(resetPasswordEmail, {
          url,
          appName: runtimeConfig.appName,
          username: user.name,
        }, {
          pretty: true,
        }),
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }, _) => {
      const runtimeConfig = useRuntimeConfig()
      await useNodeMailer().sendMail({
        subject: `Verifiziere deinen ${runtimeConfig.appName} Account`,
        text: await render(verifyAccountEmail, {
          url,
          appName: runtimeConfig.appName,
        }, {
          pretty: true,
        }),
        to: user.email,
        html: await render(verifyAccountEmail, {
          url,
          appName: runtimeConfig.appName,
        }, {
          pretty: true,
        }),
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
      sendChangeEmailVerification: async ({ user, newEmail, url }, _) => {
        const runtimeConfig = useRuntimeConfig()
        await useNodeMailer().sendMail({
          subject: `Verifiziere deine neue Email Adresse für ${runtimeConfig.appName}`,
          text: await render(UpdatedEmailVerificationTemplate, {
            url,
            username: user.name,
            newEmail,
          }, {
            pretty: true,
          }),
          to: user.email,
          html: await render(UpdatedEmailVerificationTemplate, {
            url,
            username: user.name,
            newEmail,
          }, {
            pretty: true,
          }),
        })
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
export async function getUser(event: Event): Promise<UserDetail | null> {
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  return sessionToUserDetail(session)
}

/**
 * getUserDetailOrThrowError()
 */
export async function getUserOrThrowError(event: Event): Promise<UserDetail> {
  const user = await getUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Not logged in" })
  }
  return user
}
