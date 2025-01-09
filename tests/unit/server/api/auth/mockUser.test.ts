import { describe, expect, expectTypeOf, it, vi } from "vitest"
import { mockNuxtImport } from "@nuxt/test-utils/runtime"
import type { H3Event, EventHandlerRequest } from "h3"
import { v4 as uuidv4 } from "uuid"
import { getUser } from "~~/server/utils/auth"
// import { mockUser } from "~~/tests/helpers/auth"

describe("Test mocking of signed in user", async () => {
  it("Test mocking of signed in user", async () => {
    const user = {
      id: uuidv4(),
      username: "User",
      role: UserRole.User,
      emailVerified: true,
      email: "user@test.test",
    }

    mockUser(user)

    const event = {
      context: {
        params: {
        },
      },
      // headers: {},
      body: {},
    } as unknown as H3Event<EventHandlerRequest>
    const res = await getUser(event)

    expectTypeOf(res).toEqualTypeOf<UserDetail | null>()
    expect(res).toStrictEqual(user)
  })
})
