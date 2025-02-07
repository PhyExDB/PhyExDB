import type { Prisma } from "@prisma/client"
import { vi } from "vitest"
import type { TestContext } from "./utils"

/* eslint-disable @typescript-eslint/no-explicit-any */
type CheckWhereClause = (where: any) => boolean

/**
 * Checks if the provided `where` clause contains either the `id` or `slug` from the given data.
 */
export function checkWhereClauseSlugOrId(data: SlugList) {
  return (where: any) => {
    return where.id === data.id || where.slug === data.slug
  }
}
/**
 * Checks if the provided `where` clause contains the `id` from the given data.
 */
export function checkWhereClauseId(data: BaseList) {
  return (where: any) => {
    return where.id === data.id
  }
}

/**
 * Creates a mock implementation of a Prisma function that resolves with the provided data
 * and checks the `where` clause using the provided callback function.
 */
export function prismaMockResolvedCheckingWhereClause<T>(data: T, checkWhereClause: CheckWhereClause) {
  return vi.fn().mockImplementation(({ where }) => {
    if (!checkWhereClause(where)) {
      return Promise.resolve(null)
    }
    return Promise.resolve(data)
  })
}

type Tables = Uncapitalize<Prisma.ModelName>

/**
 * Mocks the Prisma client methods for a specific table to simulate a request.
 */
export function mockPrismaForGet<Data, Exp>(
  c: TestContext<Data, Exp>,
  table: Tables,
  checkWhereClause: CheckWhereClause,
) {
  prisma[table].findFirst = prismaMockResolvedCheckingWhereClause(c.data, checkWhereClause)
  prisma[table].findUnique = prismaMockResolvedCheckingWhereClause(c.data, checkWhereClause)
}
/**
 * Mocks the Prisma client methods for a specific table to simulate a request.
 */
export function mockPrismaForSlugOrIdGet<Data extends SlugList, Exp>(
  c: TestContext<Data, Exp>,
  table: Tables,
) {
  const checkWhereClause = checkWhereClauseSlugOrId(c.data)
  mockPrismaForGet(c, table, checkWhereClause)
}
/**
 * Mocks the Prisma client methods for a specific table to simulate a request.
 */
export function mockPrismaForIdGet<Data extends BaseList, Exp>(
  c: TestContext<Data, Exp>,
  table: Tables,
) {
  const checkWhereClause = checkWhereClauseId(c.data)
  mockPrismaForGet(c, table, checkWhereClause)
}

/**
 * Mocks the Prisma client methods for a specific table to simulate a PUT request.
 */
export function mockPrismaForPut<Data, Exp>(
  c: TestContext<Data, Exp>,
  table: Tables,
  checkWhereClause: CheckWhereClause,
) {
  mockPrismaForGet(c, table, checkWhereClause)

  prisma[table].update = prismaMockResolvedCheckingWhereClause(c.expected, checkWhereClause)
}
/**
 * Mocks the Prisma client methods for a specific table to simulate a request.
 */
export function mockPrismaForSlugOrIdPut<Data extends SlugList, Exp>(
  c: TestContext<Data, Exp>,
  table: Tables,
) {
  const checkWhereClause = checkWhereClauseSlugOrId(c.data)
  mockPrismaForPut(c, table, checkWhereClause)
}
/**
 * Mocks the Prisma client methods for a specific table to simulate a request.
 */
export function mockPrismaForIdPut<Data extends BaseList, Exp>(
  c: TestContext<Data, Exp>,
  table: Tables,
) {
  const checkWhereClause = checkWhereClauseId(c.data)
  mockPrismaForPut(c, table, checkWhereClause)
}

/**
 * Mocks the Prisma client methods for a specific table to simulate a request.
 */
export function mockPrismaForGetAll<T, Data extends Array<T>, Exp>(
  c: Pick<TestContext<Data, Exp>, "data">,
  table: Tables,
) {
  prisma[table].findMany = vi.fn().mockImplementation(
    (params?: { skip?: number, take?: number }) => {
      const skip = params?.skip || 0
      const take = params?.take || c.data.length
      return Promise.resolve(c.data.slice(skip, skip + take))
    })
  prisma[table].count = vi.fn().mockResolvedValue(c.data.length)
}

/**
 * Mocks the Prisma client methods for a specific table to simulate a request.
 */
export function mockPrismaForPost<Data, Exp>(
  c: Pick<TestContext<Data, Exp>, "expected">,
  table: Tables,
) {
  prisma[table].create = vi.fn().mockImplementation(
    _ => Promise.resolve(c.expected),
  )
}
