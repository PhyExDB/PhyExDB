import { describe, expect, expectTypeOf, it } from "vitest"
import * as u from "~~/tests/helpers/utils"
import { v4 as uuidv4 } from "uuid"
import { getUser } from "~~/server/utils/auth"

describe("Test mocking event", async () => {
  it("query", () => {
    const query = { id: "123" }
    expect(getQuery(u.getEvent({ query }))).toStrictEqual(query)
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
