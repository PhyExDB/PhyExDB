import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => {
  const prisma = new PrismaClient({
    log: [
      {
        emit: "event",
        level: "query",
      },
      {
        emit: "event",
        level: "error",
      },
      {
        emit: "event",
        level: "info",
      },
      {
        emit: "event",
        level: "warn",
      },
    ],
  })

  prisma.$on("query", (e) => {
    if (process.env.NODE_ENV !== "test") {
      dbLogger.debug(e.query, { params: e.params })
    }
  })
  prisma.$on("error", (e) => {
    if (process.env.NODE_ENV !== "test") {
      dbLogger.error(e.message)
    }
  })
  prisma.$on("info", (e) => {
    if (process.env.NODE_ENV !== "test") {
      dbLogger.info(e.message)
    }
  })
  prisma.$on("warn", (e) => {
    if (process.env.NODE_ENV !== "test") {
      dbLogger.warn(e.message)
    }
  })

  const extendedPrisma = prisma.$extends({
    result: {
      user: {
        toUserList: {
          needs: { id: true, username: true, role: true, verified: true },
          compute(user) {
            return () => {
              return {
                id: user.id,
                username: user.username,
                role: user.role,
                verified: user.verified,
              }
            }
          },
        },
      },
    },
  })

  return extendedPrisma
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma
