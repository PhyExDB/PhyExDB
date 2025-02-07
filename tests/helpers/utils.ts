import type { H3Event, EventHandlerRequest } from "h3"
import { v4 as uuidv4 } from "uuid"
import { expect, it, vi } from "vitest"
import type { Prisma } from "@prisma/client"
import { mockUser } from "~~/tests/helpers/auth"

/* eslint-disable @typescript-eslint/no-explicit-any */
type Event = H3Event<EventHandlerRequest>
type Endpoint<T> = (event: Event) => Promise<T>
type Params = Record<string, string>
type Query = Record<string, any>
type Body = any
type TestContext<Data, Expected> = {
  data: Data
  expected: Expected
  endpoint: Endpoint<Expected>
  body: Body
  params: Params
  query: Query
}

/**
 * Constructs a test context object by merging the provided configuration with default values.
 */
export function getTestContext<Data, Expected, T extends {
  data: Data
  expected: Expected
  endpoint: Endpoint<Expected>
  body?: Body
  params?: Params
  query?: Query
}>(c: T) {
  return {
    ...c,
    body: c.body || {},
    params: c.params || {},
    query: c.query || {},
  }
}

/**
 * A utility type that extracts the resolved type of a Promise returned by a endpoint.
*/
export type EndpointResult<T extends (...args: any) => Promise<any>> = Awaited<ReturnType<T>>

/**
 * Creates an H3Event object with the specified parameters and body.
 */
export function getEvent(options: { params?: Params, body?: object, query?: Query }): Event {
  return {
    context: {
      params: options.params || {},
      query: options.query || {},
    },
    body: options.body || {},
  } as unknown as Event
}

/**
 * Creates an H3Event object with the specified id as parameter and body.
 */
export function getEventWithIdParam(options: { id: string, body?: object }): Event {
  return getEvent({ params: { id: options.id }, body: options.body })
}

/**
 * Executes a provided function twice, once with an object containing the `id` property
 * and once with an object containing the `slug` property from the given data.
 */
export function forSlugAndId(slugList: SlugList, func: (params: { slug: string } | { id: string }) => void) {
  func({ slug: slugList.id })
  func({ slug: slugList.slug })
}

/**
 * Creates an event object with the provided data and executes the provided function.
 */
export function forSlugAndIdEvent(slugList: SlugList, body: object, func: (event: Event) => void) {
  forSlugAndId(slugList, (params) => {
    func(getEvent({ params, body }))
  })
}

/**
 * Paginates an array of items.
 */
export function page<T>(arr: T[], page?: number, pageSize?: number): Page<T> {
  page = page || 1
  pageSize = pageSize || 12
  return {
    items: arr.slice((page - 1) * pageSize, page * pageSize),
    pagination: {
      total: arr.length,
      totalPages: Math.ceil(arr.length / pageSize),
      page,
      pageSize,
    },
  }
}

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

/**
 * Extends a given TestContext object with partial properties from another TestContext object,
 * shallow combining the body, params and query objects.
 */
export function extendContext<Data, Exp, Data2, Exp2>(
  c: TestContext<Data, Exp>,
  e: Partial<TestContext<Data2, Exp2>>,
) {
  return {
    ...c, ...e,
    body: { ...c.body, ...e.body },
    params: { ...c.params, ...e.params },
    query: { ...c.query, ...e.query },
  }
}

/**
 * Asserts that the response from the given test context's endpoint matches the expected value.
 */
export async function expectSuccess<Data, Exp>(c: TestContext<Data, Exp>) {
  const response = await c.endpoint(getEvent(c))
  expect(response).toStrictEqual(c.expected)
}

/**
 * Asserts that the provided test context results in a rejection that contains the expected error object.
 */
export async function expectErrorObjectContaining<Data, Exp>(
  c: TestContext<Data, Exp>,
  error: object,
) {
  await expect(c.endpoint(getEvent(c))).rejects.toThrow(
    expect.objectContaining(error),
  )
}

/**
 * Asserts that the provided test context results in a rejection that matches the expected error object.
 */
export async function expectErrorObjectMatching<Data, Exp>(
  c: TestContext<Data, Exp>,
  error: object,
) {
  await expect(c.endpoint(getEvent(c))).rejects.toMatchObject(error)
}

/**
 * Tests if the given endpoint function succeeds and returns the expected result
 */
export async function testSuccess<Data, Exp>(c: TestContext<Data, Exp>) {
  it(`should_succeed`, async () => {
    await expectSuccess(c)
  })
}

/**
 * Tests an endpoint function with a given slug list and body, expecting a specific result.
 */
export async function testSuccessWithSlugAndId<Data extends SlugList, Exp>(c: TestContext<Data, Exp>) {
  it(`should_succeed`, async () => {
    forSlugAndId(c.data, async (params) => {
      await expectSuccess(extendContext(c, { params }))
    })
  })
}

/**
 * Tests an endpoint function with diffrent pagination parameters.
 */
export async function testSuccessWithPagination<T>(c: TestContext<T[], Page<T>>) {
  it(`should_succeed`, async () => {
    const queries = [
      {},
      { page: 1, pageSize: 12 },
      { page: 2, pageSize: 12 },
      { page: 1, pageSize: 1 },
      { page: 2, pageSize: 1 },
      { page: 3, pageSize: 1 },
      { page: 1, pageSize: 2 },
      { page: 2, pageSize: 2 },
    ]

    for (const query of queries) {
      const expected = page(c.data, query.page, query.pageSize)
      await expectSuccess(
        extendContext(c, { expected, query }),
      )
    }
  })
}

/**
 * Tests common error scenarios for endpoints that use ids.
 */
export async function testIdFails<Data extends BaseList, Exp>(c: TestContext<Data, Exp>) {
  it ("should_fail_when_unknown_id", async () => {
    await expectErrorObjectContaining(
      extendContext(c, { params: { id: uuidv4() } }),
      {
        statusCode: 404,
      },
    )
  })

  it("should_fail_when_no_id", async () => {
    const params = { ...c.params }
    delete params.id
    await expectErrorObjectContaining(
      { ...c, params },
      {
        message: "Invalid id",
        statusCode: 400,
      },
    )
  })
}

/**
 * Tests common error scenarios for endpoints that use slugs.
 */
export async function testSlugFails<Data extends SlugList, Exp>(c: TestContext<Data, Exp>) {
  it ("should_fail_when_unknown_slug", async () => {
    const data = { id: uuidv4(), slug: "unknown-slug" }

    forSlugAndId(data, async (params) => {
      await expectErrorObjectContaining(
        extendContext(c, { params }),
        {
          statusCode: 404,
        },
      )
    })
  })

  it("should_fail_when_no_slug", async () => {
    const params = { ...c.params }
    delete params.slug
    expectErrorObjectContaining(
      { ...c, params },
      {
        message: "Invalid slug",
        statusCode: 400,
      },
    )
  })
}

/**
 * Creates an object containing a Jest matcher that checks if a string contains the specified message.
 */
export function expectMessage(message: string) {
  return {
    message: expect.stringContaining(message),
  }
}

/**
 * Tests that the given endpoint fails with a ZodError for each body in the failingBodies array.
 */
export async function testZodFail<Data, Exp>(
  c: TestContext<Data, Exp>,
  failingBodies: (
    { body: object, error?: object }
    | { body: object, message?: string }
  )[],
) {
  it(`should_fail_zod`, async () => {
    failingBodies.forEach(
      async (
        { body, error, message }:
        { body: object, error?: object, message?: string },
      ) => {
        await expectErrorObjectContaining(
          { ...c, body },
          {
            name: "ZodError",
            ...error,
            ...message ? expectMessage(message) : undefined,
          },
        )
      },
    )
  })
}

/**
 * Tests that the given endpoint fails with a ZodError when provided with an empty body.
 */
export async function testZodFailWithEmptyBody<Data, Exp>(c: TestContext<Data, Exp>) {
  await testZodFail(c, [{ body: {} }])
}

/**
 * Tests that the provided endpoint fails authentication for the given users.
 * Needs to be last, because it changes the user mock!!!
 */
export async function testAuthFail<Data, Exp>(
  c: TestContext<Data, Exp>,
  failingUsers: (UserDetail | null)[],
) {
  it(`should_fail_auth`, async () => {
    failingUsers.forEach(async (failingUser) => {
      mockUser(failingUser)
      const expectedStatusCode = failingUser ? 403 : 401

      await expectErrorObjectMatching(
        c,
        {
          statusCode: expectedStatusCode,
        },
      )
    })
  })
}
