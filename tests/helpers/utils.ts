import type { H3Event, EventHandlerRequest } from "h3"
import { v4 as uuidv4 } from "uuid"
import { expect, it, vi } from "vitest"
import type { Prisma } from "@prisma/client"
import { mockUser } from "~~/tests/helpers/auth"

type Event = H3Event<EventHandlerRequest>
type Endpoint<T> = (event: Event) => Promise<T>
type Params = Record<string, string>
type Query = Record<string, any>
type Body = any
type TestContext<Data, Expected> = {
  data: Data,
  expected: Expected,
  endpoint: Endpoint<Expected>,
  body: Body,
  params: Params,
  query: Query,
}

/**
 * A utility type that extracts the resolved type of a Promise returned by a endpoint.
*/
/* eslint-disable @typescript-eslint/no-explicit-any */
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
export function checkWhereClauseSlugOrId(data: { id: string, slug: string }) {
  return (where: any) => {
    return where.id === data.id || where.slug === data.slug
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
 * Mocks the Prisma client methods for a specific table to simulate a PUT request.
 */
export function mockPrismaForPut<T>(table: Tables, data: T, expected: T, checkWhereClause: CheckWhereClause) {
  prisma[table].findFirst = prismaMockResolvedCheckingWhereClause(data, checkWhereClause)
  prisma[table].findUnique = prismaMockResolvedCheckingWhereClause(data, checkWhereClause)

  prisma[table].update = prismaMockResolvedCheckingWhereClause(expected, checkWhereClause)
}

/**
 * Mocks the Prisma client methods for a specific table to simulate a request.
 */
export function mockPrismaForSlugOrIdGet<T extends SlugList>(
  table: Tables,
  data: T,
  _?: any,
) {
  const checkWhereClause = checkWhereClauseSlugOrId(data)

  prisma[table].findFirst = prismaMockResolvedCheckingWhereClause(data, checkWhereClause)
  prisma[table].findUnique = prismaMockResolvedCheckingWhereClause(data, checkWhereClause)
}
/**
 * Mocks the Prisma client methods for a specific table to simulate a request.
 */
export function mockPrismaForSlugOrIdPut<T extends SlugList>(
  table: Tables,
  data: T,
  expected: T,
) {
  const checkWhereClause = checkWhereClauseSlugOrId(data)

  prisma[table].findFirst = prismaMockResolvedCheckingWhereClause(data, checkWhereClause)
  prisma[table].findUnique = prismaMockResolvedCheckingWhereClause(data, checkWhereClause)

  prisma[table].update = prismaMockResolvedCheckingWhereClause(expected, checkWhereClause)
}
/**
 * Mocks the Prisma client methods for a specific table to simulate a request.
 */
export function mockPrismaForGetAll<T>(
  table: Tables,
  data: Array<T>,
  _?: any,
) {
  prisma[table].findMany = vi.fn().mockImplementation(
    ({ skip, take }: { skip: number, take: number } = { skip: 0, take: data.length }) => {
      return Promise.resolve(data.slice(skip, skip + take))
    })
  prisma[table].count = vi.fn().mockResolvedValue(data.length)
}

/**
 * Extends a given TestContext object with partial properties from another TestContext object, shallow combining the body, params and query objects.
 */
export function extendContext<Data, Exp, Data2, Exp2>(
  c: TestContext<Data, Exp>,
  e: Partial<TestContext<Data2, Exp2>>
){
  return {
    ...c, ...e,
    body: {...c.body, ...e.body},
    params: {...c.params, ...e.params},
    query: {...c.query, ...e.query},
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
  expect(c.endpoint(getEvent(c))).rejects.toThrow(
    expect.objectContaining(error)
  )
}

/**
 * Asserts that the provided test context results in a rejection that matches the expected error object.
 */
export async function expectErrorObjectMatching<Data, Exp>(
  c: TestContext<Data, Exp>,
  error: object,
) {
  expect(c.endpoint(getEvent(c))).rejects.toMatchObject(error)
}



/**
 * Tests if the given endpoint function succeeds and returns the expected result
 */
export function testSuccess<Data, Exp>(c: TestContext<Data, Exp>) {
  it(`should_succeed`, async () => {
    expectSuccess(c)
  })
}

/**
 * Tests an endpoint function with a given slug list and body, expecting a specific result.
 */
export function testSuccessWithSlugAndId<Data extends SlugList, Exp>(c: TestContext<Data, Exp>) {
  it(`should_succeed`, async () => {
    forSlugAndId(c.data, async (params) => {
      expectSuccess(extendContext(c, { params }))
    })
  })
}

/**
 * Tests an endpoint function with diffrent pagination parameters.
 */
export function testSuccessWithPagination<T>(c: TestContext<T[], Page<T>>) {
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
      expectSuccess(
        extendContext(c, { expected, query })
      )
    }
  })
}

/**
 * Tests common error scenarios for endpoints that use ids.
 */
export function testIdFails<Data extends BaseList, Exp>(c: TestContext<Data, Exp>) {
  it ("should_fail_when_unknown_id", async () => {
    expectErrorObjectContaining(
      extendContext(c, { params: { id: uuidv4() } }),
      {
        statusCode: 404,
      },
    )
  })

  it("should_fail_when_no_id", async () => {
    const params = { ...c.params }
    delete params.id
    expectErrorObjectContaining(
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
export function testSlugFails<Data extends SlugList, Exp>(c: TestContext<Data, Exp>) {
  it ("should_fail_when_unknown_slug", async () => {
    const data = { id: uuidv4(), slug: "unknown-slug" }

    forSlugAndId(data, async (params) => {
      expectErrorObjectContaining(
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
export function testZodFail<Data, Exp>(
  c: TestContext<Data, Exp>,
  failingBodies: { body: object, error?: object }[],
) {
  it(`should_fail_zod`, async () => {
    failingBodies.forEach(async ({ body, error }) => {
      expectErrorObjectContaining(
        { ...c, body },
        {
          name: "ZodError",
          ...error,
        },
      )
    })
  })
}

/**
 * Tests that the given endpoint fails with a ZodError for each of the provided failing bodies.
 */
export function testZodFailMessage<Data, Exp>(
  c: TestContext<Data, Exp>,
  failingBodies: { body: object, message?: string }[],
) {
  testZodFail(
    c,
    failingBodies.map(({ body, message }) =>
      ({ body, error: message ? expectMessage(message) : undefined }),
    ),
  )
}

/**
 * Tests that the given endpoint fails with a ZodError when provided with an empty body.
 */
export function testZodFailWithEmptyBody<Data, Exp>(c: TestContext<Data, Exp>) {
  testZodFail(c, [{ body: {} }])
}

/**
 * Tests that the provided endpoint fails authentication for the given users.
 * Needs to be last, because it changes the user mock!!!
 */
export function testAuthFail<Data, Exp>(
  c: TestContext<Data, Exp>,
  failingUsers: (UserDetail | null)[],
) {
  it(`should_fail_auth`, async () => {
    failingUsers.forEach(async (failingUser) => {
      mockUser(failingUser)
      const expectedStatusCode = failingUser ? 403 : 401

      expectErrorObjectMatching(
        c,
        {
          statusCode: expectedStatusCode,
        },
      )
    })
  })
}
