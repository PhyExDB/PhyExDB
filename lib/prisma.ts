import { PrismaClient } from "@prisma/client"
import type { ExperimentAttributeValueList } from "~~/shared/types/ExperimentAttributeValue.type"

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
      legalDocument: {
        toList: {
          needs: { id: true, name: true, slug: true },
          compute(legal) {
            return () => {
              return {
                id: legal.id,
                name: legal.name,
                slug: legal.slug,
              }
            }
          },
        },
        toDetail: {
          needs: { id: true, name: true, slug: true, text: true },
          compute(legal) {
            return () => {
              return {
                id: legal.id,
                name: legal.name,
                slug: legal.slug,
                text: legal.text,
              }
            }
          },
        },
      },
      user: {
        toList: {
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
        toDetail: {
          needs: { id: true, email: true, username: true, role: true, verified: true },
          compute(user) {
            return () => {
              return {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                verified: user.verified,
              }
            }
          },
        },
      },
      experimentAttribute: {
        toList: {
          needs: { id: true, name: true, slug: true },
          compute(attribute) {
            return () => {
              return {
                id: attribute.id,
                name: attribute.name,
                slug: attribute.slug,
              }
            }
          },
        },
        toDetail: {
          needs: { id: true, name: true, slug: true },
          compute(attribute) {
            return (values: ExperimentAttributeValueList[]) => {
              return {
                id: attribute.id,
                name: attribute.name,
                slug: attribute.slug,
                values: values,
              }
            }
          },
        },
      },
      experimentAttributeValue: {
        toList: {
          needs: { id: true, name: true },
          compute(value) {
            return () => {
              return {
                id: value.id,
                name: value.name,
              }
            }
          },
        },
        toDetail: {
          needs: { id: true, name: true },
          compute(value) {
            return () => {
              return {
                id: value.id,
                name: value.name,
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

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma
}
