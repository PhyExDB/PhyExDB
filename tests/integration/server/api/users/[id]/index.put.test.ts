import { describe, expect, it } from "vitest"
import { setup, $fetch } from "@nuxt/test-utils/e2e"
import { v4 as uuidv4 } from "uuid"
import prisma from "../../../../../../server/utils/prisma"

describe("Api Route PUT /api/users/{id}", async () => {
  await setup()

  it ("Should update a user via username", async () => {
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

  it ("Should update a user via user id", async () => {
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
    await $fetch(`/api/users/${newUser.id}`, {
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

  it.each([[`correctUsername`, "WrongEmail"], ["", "correctMail@gmail.com"], ["correctUsername", ""]])(
    "Throw error when update data is missing or in wrong format",
    async (username, email) => {
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
      const changedName = { username: username, email: email }

      // Update user info with new username
      const response = await $fetch(`/api/users/${newUser.id}`, {
        method: "PUT",
        body: changedName,
      }).catch(e => e.data.statusCode)

      expect(response).toBe(400)
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
