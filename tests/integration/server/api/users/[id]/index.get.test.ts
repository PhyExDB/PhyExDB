import { describe, expect, it, expectTypeOf } from "vitest"
import { describe, expect, it, expectTypeOf } from "vitest"
import { setup, $fetch } from "@nuxt/test-utils/e2e"
import { v4 as uuidv4 } from "uuid"
import prisma from "../../../../../../server/utils/prisma"

describe("Api Route GET /api/users/{id}", async () => {
  await setup()

  it ("Should get a user via user id", async () => {
    const uuid = uuidv4()
    const newUser = await prisma.user.create({
      data: {
        username: `user${uuid}`,
        email: `${uuid}@gmail.test`,
        passwordHash: "MeinPassword123",
        role: "USER",
        verified: true,
      },
    })
    const user = await $fetch(`/api/users/${newUser.id}`, {
      method: "GET",
    })
    expect(user.id).toEqual(newUser.id)
    expectTypeOf(user).toEqualTypeOf<UserDetail>()
  })

  it ("Should get a user via username", async () => {
    const uuid = uuidv4()
    const newUser = await prisma.user.create({
      data: {
        username: `user${uuid}`,
        email: `${uuid}@gmail.test`,
        passwordHash: "MeinPassword123",
        role: "USER",
        verified: true,
      },
    })
    const user = await $fetch(`/api/users/${newUser.username}`, {
      method: "GET",
    })
    expect(user.id).toEqual(newUser.id)
    expectTypeOf(user).toEqualTypeOf<UserDetail>()
  })

  const uuid = uuidv4()
  it.each([`unknownUser${uuid}`, uuid])("Throw error when user not found", async (usernameOrId) => {
    const changedName = { username: "correctName", email: "correctName@gmail.com" }

    // Update user info with new username
    const response = await $fetch(`/api/users/${usernameOrId}`, {
      method: "PUT",
      body: changedName,
    }).catch(e => e.data.statusCode)

    expect(response).toBe(404)
  })
})