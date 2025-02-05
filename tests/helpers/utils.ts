import type { H3Event, EventHandlerRequest } from "h3"
import { v4 as uuidv4 } from "uuid"
import { expect, it, vi } from "vitest"
import type { Prisma } from "@prisma/client"
import { mockUser } from "~~/tests/helpers/auth"

type Event = H3Event<EventHandlerRequest>

/**
 * Creates an H3Event object with the specified parameters and body.
 */
export function getEvent(options: { params?: object, body?: object }): Event {
  return {
    context: {
      params: options.params || {},
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
export function forSlugAndId(data: SlugList, func: (params: { slug: string } | { id: string }) => void) {
  func({ slug: data.id })
  func({ slug: data.slug })
}

/**
 * Creates an event object with the provided data and executes the provided function.
 */
export function forSlugAndIdEvent(data: SlugList, body: object, func: (event: Event) => void) {
  forSlugAndId(data, (params) => {
    func(getEvent({ params, body }))
  })
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
      return null
    }
    return Promise.resolve(data)
  })
}

type Tables = Uncapitalize<Prisma.ModelName>

/**
 * Mocks the Prisma client methods for a specific table to simulate a POST request.
 */
export function mockPrismaForPost<T>(table: Tables, data: T, expected: T, checkWhereClause: CheckWhereClause) {
  prisma[table].findFirst = prismaMockResolvedCheckingWhereClause(data, checkWhereClause)
  prisma[table].findUnique = prismaMockResolvedCheckingWhereClause(data, checkWhereClause)

  prisma[table].update = prismaMockResolvedCheckingWhereClause(expected, checkWhereClause)
}
/**
 * Mocks the Prisma client methods for a specific table to simulate a POST request.
 */
export function mockPrismaForPutSlugOrId<T extends SlugList>(table: Tables, data: T, expected: T) {
  const checkWhereClause = checkWhereClauseSlugOrId(data)

  prisma[table].findFirst = prismaMockResolvedCheckingWhereClause(data, checkWhereClause)
  prisma[table].findUnique = prismaMockResolvedCheckingWhereClause(data, checkWhereClause)

  prisma[table].update = prismaMockResolvedCheckingWhereClause(expected, checkWhereClause)
}

/**
 * Tests common error scenarios for endpoints that use ids.
 */
export function testIdFails<T>(body: object, endpoint: (event: Event) => Promise<T>) {
  it ("should_fail_when_unknown_id", async () => {
    const event = getEventWithIdParam({ id: uuidv4(), body })

    await expect(endpoint(event)).rejects.toThrowError(
      expect.objectContaining({
        statusCode: 404,
      }),
    )
  })

  it("should_fail_when_no_id", async () => {
    const event = getEvent({ body })

    await expect(endpoint(event)).rejects.toMatchObject({
      message: "Invalid slug",
      statusCode: 400,
    })
  })
}

/**
 * Tests common error scenarios for endpoints that use slugs.
 */
export function testSlugFails<T>(body: object, endpoint: (event: Event) => Promise<T>) {
  it ("should_fail_when_unknown_slug", async () => {
    const data = { id: uuidv4(), slug: "unknown-slug" }

    forSlugAndIdEvent(data, body, async (event) => {
      await expect(endpoint(event)).rejects.toThrowError(
        expect.objectContaining({
          statusCode: 404,
        }),
      )
    })
  })

  it("should_fail_when_no_slug", async () => {
    const event = getEvent({ body })

    await expect(endpoint(event)).rejects.toMatchObject({
      message: "Invalid slug",
      statusCode: 400,
    })
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
export function testZodFail<T>(
  params: object,
  endpoint: (event: Event) => Promise<T>,
  failingBodies: { body: object, error?: object }[],
) {
  it(`should_fail_zod`, async () => {
    failingBodies.forEach(async ({ body, error }) => {
      const event = getEvent({ params, body })
      await expect(endpoint(event)).rejects.toThrowError(
        expect.objectContaining({
          name: "ZodError",
          ...error,
        }),
      )
    })
  })
}

/**
 * Tests that the given endpoint fails with a ZodError for each of the provided failing bodies.
 */
export function testZodFailMessage<T>(
  params: object,
  endpoint: (event: Event) => Promise<T>,
  failingBodies: { body: object, message?: string }[],
) {
  testZodFail(params, endpoint, failingBodies.map(({ body, message }) => ({ body, error: message ? expectMessage(message) : undefined })))
}

/**
 * Tests that the given endpoint fails with a ZodError when provided with an empty body.
 */
export function testZodFailWithEmptyBody<T>(params: object, endpoint: (event: Event) => Promise<T>) {
  testZodFail(params, endpoint, [{ body: {} }])
}

/**
 * Tests that the provided endpoint fails authentication for the given users.
 * Needs to be last, because it changes the user mock!!!
 */
export function testAuthFail<T>(
  event: Event,
  endpoint: (event: Event) => Promise<T>,
  failingUsers: (UserDetail | null)[],
) {
  it(`should_fail_auth`, async () => {
    failingUsers.forEach(async (failingUser) => {
      mockUser(failingUser)
      const expectedStatusCode = failingUser ? 403 : 401

      await expect(endpoint(event)).rejects.toMatchObject({
        statusCode: expectedStatusCode,
      })
    })
  })
}
