import type { H3Event, EventHandlerRequest } from "h3"
import { betterAuth } from "better-auth"
import { APIError } from "better-auth/api"
import { admin } from "better-auth/plugins"
import { prismaAdapter } from "better-auth/adapters/prisma"
import prisma from "../../server/utils/prisma"

/**
 * betterAuth config
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  trustedOrigins: useRuntimeConfig().trustedOrigins.split(","),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }, _) => {
      const runtimeConfig = useRuntimeConfig()
      await useNodeMailer().sendMail({
        subject: "Verifying PHYEXDB email-address",
        text: `Bitte klicke auf den folgenden Link um deinen PhyExDB Account zu verifizieren: ${url}.`,
        to: user.email,
        html: `<!DOCTYPE html>
      <html lang="de">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verifiziere deine E-Mail</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #ffffff;
                  color: #e2e8f0;
                  text-align: center;
                  padding: 20px;
              }
              .container {
                  max-width: 600px;
                  background-color: #1e293b;
                  padding: 20px;
                  border-radius: 10px;
                  margin: auto;
                  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
              }
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #ffffff;
                  color: #1e293b;
                  text-decoration: none;
                  font-weight: bold;
                  border-radius: 5px;
                  margin-top: 20px;
              }
              .footer {
                  margin-top: 20px;
                  font-size: 12px;
                  color: #94a3b8;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Willkommen bei ${runtimeConfig.appName}!</h1>
              <p>Um dein Konto zu aktivieren, bestätige bitte deine E-Mail-Adresse, indem du auf den Button unten klickst.</p>
              <a href="${url}" class="button">E-Mail bestätigen</a>
              <p class="footer">Falls du dich nicht registriert hast, kannst du diese E-Mail ignorieren.</p>
          </div>
      </body>
      </html>
      `,
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
