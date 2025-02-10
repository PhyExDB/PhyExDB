import type { H3Event, EventHandlerRequest } from "h3"
import { v4 as uuidv4 } from "uuid"
import { expect, it } from "vitest"

export * from "./mock"

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Event */
export type Event = H3Event<EventHandlerRequest>
/** Endpoint */
export type Endpoint<T> = (event: Event) => Promise<T>
/** Params of Events */
export type Params = Record<string, string>
/** Query of Events */
export type Query = Record<string, any>
/** Body of Events */
export type Body = any
/**
 * Represents the context for a test case, including the data, expected result,
 * endpoint, request body, parameters, and query.
 */
export type TestContext<Data, Expected> = {
  data: Data
  expected: Expected
  endpoint: Endpoint<Expected>
  body: Body
  params: Params
  query: Query
  user: UserDetail | null
  additionalEventProperties: object
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
  user?: UserDetail | null
  additionalEventProperties?: object
}>(c: T) {
  return {
    ...c,
    body: c.body || {},
    params: c.params || {},
    query: c.query || {},
    user: c.user || null,
    additionalEventProperties: c.additionalEventProperties || {},
  }
}

/**
 * A utility type that extracts the resolved type of a Promise returned by a endpoint.
*/
export type EndpointResult<T extends (...args: any) => Promise<any>> = Awaited<ReturnType<T>>

/**
 * Creates an H3Event object with the specified parameters and body.
 */
export function getEvent(options: {
  params?: Params
  body?: object
  query?: Query
  user?: UserDetail | null
  additionalEventProperties?: object
}): Event {
  return {
    context: {
      params: options.params || {},
      query: options.query || {},
      user: options.user || null,
    },
    body: options.body || {},
    ...options.additionalEventProperties,
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
export async function testSuccessWithPagination<S, T>(c: TestContext<S[], Page<T>>, expectedArray: T[]) {
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
      const expected = page(expectedArray, query.page, query.pageSize)
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
      const expectedStatusCode = failingUser ? 403 : 401

      await expectErrorObjectMatching(
        extendContext(c, { user: failingUser }),
        {
          statusCode: expectedStatusCode,
        },
      )
    })
  })
}
