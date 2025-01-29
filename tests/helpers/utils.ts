import type { H3Event, EventHandlerRequest } from "h3"
import { expect, assert, vi } from "vitest"
import { Prisma } from "@prisma/client"

/**
 * Creates an H3Event object with the specified parameters and body.
 */
export function getEvent( options: { params?: object, body?: object }): H3Event<EventHandlerRequest>{
    return {
        context: {
            params: options.params,
        },
        body: options.body,
    } as unknown as H3Event<EventHandlerRequest>
}

/**
 * Checks if the provided `where` clause contains either the `id` or `slug` from the given data.
 */
export function checkWhereClauseSlugOrId(data: { id: string, slug: string }) {
    return (where: any) => {
        assert(where.id === data.id || where.slug === data.slug, "The where clause should have the id or slug")
    }
}

/**
 * Creates a mock implementation of a Prisma function that resolves with the provided data
 * and checks the `where` clause using the provided callback function.
 */
export function prismaMockResolvedCheckingWhereClause<T>(data: T, checkWhereClause: (where: any) => void) {
    return vi.fn().mockImplementation(({ where }) => {
        checkWhereClause(where)
        return Promise.resolve(data)
    })
}

type tables = Uncapitalize<Prisma.ModelName>

/**
 * Mocks the Prisma client methods for a specific table to simulate a POST request.
 */
export function mockPrismaForPost<T>(table: tables, data: T, expected: T, checkWhereClause: (where: any) => void) {
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
