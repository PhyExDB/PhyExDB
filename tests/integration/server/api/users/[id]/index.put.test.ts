import { describe, expect, it } from "vitest"
import { setup, $fetch } from "@nuxt/test-utils/e2e"
import { v4 as uuidv4 } from "uuid"
import prisma from "../../../../../../server/utils/prisma"

describe("Api Route /api/users", async () => {
  await setup()

  it ("Should update a user", async () => {
    const uuid = uuidv4()
    const uuid2 = uuidv4()
    const newUser = await prisma.user.create({
      data: {
        username: `user${uuid}`,
        email: `${uuid}@gmail.test`,
        passwordHash: "MeinPassword123",
        role: "USER",
        verified: true,
      },
    })
    const changedName = { username: `user${uuid2}`, email: `${uuid2}@gmail.test` }

    // Update user info with new username
    await $fetch(`/api/users/${newUser.username}`, {
      method: "PUT",
      body: changedName,
    })

    const findChangedUser = await prisma.user.findFirst({
      where: {
        username: `user${uuid2}`,
      },
    })

    expect(findChangedUser).not.toBeNull()
  })
})
