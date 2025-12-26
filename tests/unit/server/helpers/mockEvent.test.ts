import { describe, expect, expectTypeOf, it } from "vitest"
import { v4 as uuidv4 } from "uuid"
import * as u from "~~/tests/helpers/utils"
import { getUser, getUserOrThrowError } from "~~/server/utils/auth"
import type { UserDetail } from "#shared/types"

describe("Test mocking event", async () => {
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
