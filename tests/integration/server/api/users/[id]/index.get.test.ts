import { describe, expect, it } from "vitest"
import { setup, $fetch } from "@nuxt/test-utils/e2e"
import { v4 as uuidv4 } from "uuid"
import prisma from "../../../../../../server/utils/prisma"

describe("Api Route /api/users", async () => {
  await setup()

  it ("Should get a user", async () => {
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
  })
})
