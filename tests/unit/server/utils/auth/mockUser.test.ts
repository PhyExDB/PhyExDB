import { describe, expect, expectTypeOf, it } from "vitest"
import { v4 as uuidv4 } from "uuid"
import { getUser } from "~~/server/utils/auth"
import * as u from "~~/tests/helpers/utils"

describe("Test mocking of signed in user", async () => {
  it("Test mocking of signed in user", async () => {
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
  })
})
