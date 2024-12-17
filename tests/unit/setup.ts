import type { PrismaClient } from "@prisma/client"
import { vitest } from "vitest"
import { mockDeep } from "vitest-mock-extended"

vitest.stubGlobal("defineEventHandler", (func: unknown) => func)
vitest.stubGlobal("defineRouteMeta", (func: unknown) => func)
vitest.stubGlobal("defineNitroPlugin", (e: unknown) => e)
vitest.stubGlobal("getRouterParam", (e: unknown) => e.context.params.slug)
vitest.stubGlobal("getValidatedRouterParams", (e: unknown, f: unknown) => f(e.context.params))

const prisma = mockDeep<PrismaClient>()
vitest.stubGlobal("prisma", prisma)
