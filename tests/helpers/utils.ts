import type { H3Event, EventHandlerRequest } from "h3"
import { v4 as uuidv4 } from "uuid"
import { describe, expect, expectTypeOf, it, vi } from "vitest"
import type { Prisma } from "@prisma/client"

/**
 * Creates an H3Event object with the specified parameters and body.
 */
export function getEvent(options: { params?: object, body?: object }): H3Event<EventHandlerRequest> {
  return {
    context: {
      params: options.params || {},
    },
    body: options.body || {},
  } as unknown as H3Event<EventHandlerRequest>
}

/**
 * Executes a provided function twice, once with an object containing the `id` property
 * and once with an object containing the `slug` property from the given data.
 */
export function forSlugAndId(data: SlugList, func: (params: { slug: string } | { id: string }) => void) {
  func({ slug: data.id })
  func({ slug: data.slug })
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

type tables = Uncapitalize<Prisma.ModelName>

/**
 * Mocks the Prisma client methods for a specific table to simulate a POST request.
 */
export function mockPrismaForPost<T>(table: tables, data: T, expected: T, checkWhereClause: CheckWhereClause) {
  prisma[table].findFirst = prismaMockResolvedCheckingWhereClause(data, checkWhereClause)
  prisma[table].findUnique = prismaMockResolvedCheckingWhereClause(data, checkWhereClause)

  prisma[table].update = prismaMockResolvedCheckingWhereClause(expected, checkWhereClause)
}
/**
 * Mocks the Prisma client methods for a specific table to simulate a POST request.
 */
export function mockPrismaForPostSlugOrId<T extends SlugList>(table: tables, data: T, expected: T) {
  const checkWhereClause = checkWhereClauseSlugOrId(data)

  prisma[table].findFirst = prismaMockResolvedCheckingWhereClause(data, checkWhereClause)
  prisma[table].findUnique = prismaMockResolvedCheckingWhereClause(data, checkWhereClause)

  prisma[table].update = prismaMockResolvedCheckingWhereClause(expected, checkWhereClause)
}

/**
 * Tests common error scenarios for endpoints that use slugs.
 *
 * @param body - The request body to be used in the tests.
 * @param endpoint - The endpoint function to be tested.
 *
 * @remarks
 * This function runs two tests:
 * 1. It checks that the endpoint returns a 404 error when an unknown slug is provided.
 * 2. It checks that the endpoint returns a 400 error when no slug is provided.
 *
 * @example
 * ```typescript
 * testForCommonSlugErrore({ key: "value" }, myEndpointFunction);
 * ```
 */
export function testSlugFails<T>(body: object, endpoint: (event: H3Event<EventHandlerRequest>) => Promise<T>) {
  it ("should_fail_when_unknown_slug", async () => {
    forSlugAndId({ id: uuidv4(), slug: "unknown-slug" }, async (params) => {
      const event = getEvent({ params, body })

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

export function testZodFailWithEmptyBody<T>(data: SlugList, endpoint: (event: H3Event<EventHandlerRequest>) => Promise<T>) {
  it(`should_fail_zod`, async () => {
    const body = {}

    forSlugAndId(data, async (params) => {
      const event = getEvent({ params, body })

      await expect(endpoint(event)).rejects.toThrowError(
        expect.objectContaining({
          name: "ZodError",
        }),
      )
    })
  })
}
