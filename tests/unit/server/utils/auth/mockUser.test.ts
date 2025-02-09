import { describe, expect, expectTypeOf, it } from "vitest"
import type { H3Event, EventHandlerRequest } from "h3"
import { v4 as uuidv4 } from "uuid"
import { getUser } from "~~/server/utils/auth"
import { mockUser } from "~~/tests/helpers/auth"

describe("Test mocking of signed in user", async () => {
  it("Test mocking of signed in user", async () => {
    const user: UserDetail = {
      id: uuidv4(),
      name: "User",
      role: "USER",
      emailVerified: true,
      email: "user@test.test",
    }

    mockUser(user)

    const event = {
      context: {
        params: {
        },
      },
      body: {},
    } as unknown as H3Event<EventHandlerRequest>
    const res = await getUser(event)

    expectTypeOf(res).toEqualTypeOf<UserDetail | null>()
    expect(res).toStrictEqual(user)
  })
})
