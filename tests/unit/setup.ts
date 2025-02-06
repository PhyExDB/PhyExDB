/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PrismaClient } from "@prisma/client"
import { vitest } from "vitest"
import { mockDeep } from "vitest-mock-extended"
import { createDomPurify } from "~~/server/utils/dompurify"

const prisma = mockDeep<PrismaClient>()
vitest.stubGlobal("prisma", prisma)

vitest.mock(import("~~/server/utils/auth"), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    getUser: vitest.fn(),
    getUserOrThrowError: vitest.fn(),
  }
})

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
