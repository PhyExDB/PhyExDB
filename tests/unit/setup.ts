/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PrismaClient } from "@prisma/client"
import { vitest } from "vitest"
import { mockDeep } from "vitest-mock-extended"
import { ref } from "vue"
import { createDomPurify } from "~~/server/utils/dompurify"

const prisma = mockDeep<PrismaClient>()
vitest.stubGlobal("prisma", prisma)

prisma.$transaction = ((func: (prisma: any) => Promise<any>) => {
  return func(prisma)
}) as unknown as typeof prisma.$transaction

vitest.mock(import("~~/server/lib/loggers"))

vitest.stubGlobal("useNitroApp", () => {
  return {
    domPurify: createDomPurify(),
  }
})

vitest.stubGlobal("defineEventHandler", (func: unknown) => func)
vitest.stubGlobal("defineRouteMeta", (func: unknown) => func)
vitest.stubGlobal("defineNitroPlugin", (e: unknown) => e)

vitest.stubGlobal("getValidatedRouterParams", (e: any, f: any) => f(e.context.params))
vitest.stubGlobal("getRouterParam", (event: any, paramName: string) => {
  return event.context.params[paramName]
})

vitest.stubGlobal("getQuery", (event: any) => {
  return event.context.query
})

vitest.stubGlobal("readValidatedBody", async (event: any, validator: (body: any) => any) => {
  return validator(event.body)
})
vitest.stubGlobal("readBody", async (event: any) => {
  return event.body
})

vitest.mock(import("~~/server/utils/auth"), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    getUser: (event: any) => event.context.user,
    getUserOrThrowError: (event: any) => {
      if (!event.context.user) {
        throw createError({ statusCode: 401, statusMessage: "Not logged in" })
      }
      return event.context.user
    },
  }
})

// io
vitest.stubGlobal("storeFileLocally", async (
  _: File,
  fileNameOrIdLength: string | number,
) => {
  if (typeof fileNameOrIdLength === "number") {
    return "randomId"
  }
  return fileNameOrIdLength
})
vitest.mock(import("~~/server/utils/files"), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    myDeleteFile: vitest.fn(),
  }
})

vitest.mock("#app", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    useFetch: vitest.fn().mockImplementation((url: string) => {
      const responses: Record<string, unknown> = {
        "/api/2fa/status": { enabled: false, required: false },
        "/api/auth/session": { user: null },
      }

      for (const [pattern, data] of Object.entries(responses)) {
        if (url.includes(pattern)) {
          return {
            data: ref(data),
            pending: ref(false),
            error: ref(null),
            refresh: vitest.fn(),
          }
        }
      }

      return {
        data: ref(null),
        pending: ref(false),
        error: ref(null),
        refresh: vitest.fn(),
      }
    }),
    navigateTo: vitest.fn(),
    useRuntimeConfig: vitest.fn(() => ({})),
  }
})

vitest.mock("~~/server/lib/prisma", () => ({ default: prisma }))

vitest.mock("~~/server/utils/authorization", async importOriginal => ({
  ...(await importOriginal() as any),
  ensureTwofaIfRequired: vitest.fn(),
}))
