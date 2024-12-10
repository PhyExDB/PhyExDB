import { describe, expect, it } from "vitest"
import { setup, $fetch } from "@nuxt/test-utils/e2e"
import User from "~~/server/database/models/User"
import SlugPut from "~~/server/api/legal/[slug].put"

describe("Api Route /api/users", async () => {
  await setup()

  it ("Should update a user", async () => {
    const testUserBody = { username: "changedName" }

    // Update user info with new username
    await $fetch("/api/users", {
      body: testUserBody,
    })
  })
})
