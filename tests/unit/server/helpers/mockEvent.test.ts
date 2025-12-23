import { describe, expect, expectTypeOf, it } from "vitest"
import { v4 as uuidv4 } from "uuid"
import * as u from "~~/tests/helpers/utils"
import { getUser, getUserOrThrowError } from "~~/server/utils/auth"
import type { UserDetail } from "#shared/types"
import type { H3Event } from "h3"
import { getRouterParam } from "h3"

interface MockEvent {
  body?: unknown
  context?: {
    params?: Record<string, string>
    query?: Record<string, unknown>
    user?: UserDetail | null
  }
}

function getQueryFromMock(event: MockEvent): Record<string, unknown> {
  return event.context?.query || {}
}

async function readValidatedBody<T>(event: MockEvent, validator: (body: unknown) => T): Promise<T> {
  return validator(await readBody(<H3Event>event))
}

function getValidatedRouterParams<T>(event: MockEvent, validator: (params: Record<string, string>) => T): T {
  return validator(event.context?.params || {})
}

async function readBody(event: MockEvent) {
  return event.body
}

describe("Test mocking event", async () => {
  it("query", () => {
    const query = { id: "123" }
    const event = u.getEvent({ query })
    expect(getQueryFromMock(event)).toStrictEqual(query)
  })

  it("body", async () => {
    const body = { id: "123" }
    expect(await readBody(u.getEvent({ body }))).toStrictEqual(body)
    expect(await readValidatedBody(u.getEvent({ body }), b => b)).toStrictEqual(body)
  })

  it("params", () => {
    const params = { id: "123" }
    expect(getRouterParam(u.getEvent({ params }), "id")).toStrictEqual(params.id)
    expect(getValidatedRouterParams(u.getEvent({ params }), a => a)).toStrictEqual(params)
  })

  it("user", async () => {
    const user: UserDetail = {
      id: uuidv4(),
      name: "User",
      role: "USER",
      emailVerified: true,
      email: "user@test.test",
    }

    const res = await getUser(u.getEvent({ user }))
    expectTypeOf(res).toEqualTypeOf<UserDetail | null>()
    expect(res).toStrictEqual(user)

    const res2 = await getUserOrThrowError(u.getEvent({ user }))
    expectTypeOf(res2).toEqualTypeOf<UserDetail>()
    expect(res2).toStrictEqual(user)
  })
})
