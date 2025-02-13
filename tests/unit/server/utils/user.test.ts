import { describe, expect, it } from "vitest"
import { users } from "~~/tests/helpers/auth"
import * as u from "~~/tests/helpers/utils"

import * as unit from "~~/server/utils/user"

describe("Test utils user", async () => {
  it("getUserByEvent", async () => {
    u.mockPrismaForIdGet({ data: users.user }, "user")
    expect(await unit.getUserByEvent(u.getEvent({ params: { id: users.user.id } }))).toEqual(users.user)
    expect(unit.getUserByEvent(u.getEvent({ params: { id: users.mod.id } }))).rejects.toMatchObject({
      statusCode: 404,
      message: "User not found",
    })
    expect(unit.getUserByEvent(u.getEvent({}))).rejects.toMatchObject({
      statusCode: 400,
      message: "Invalid id",
    })
  })
})
