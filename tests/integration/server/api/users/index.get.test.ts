import { describe, expect, expectTypeOf, it } from "vitest"
import { setup, $fetch } from "@nuxt/test-utils/e2e"

describe("Api Route /api/users", async () => {
  await setup()

  it("Should return a list of users", async () => {
    const response = await $fetch("/api/users")
    // Expected output structure
    const expectedStructure = [
      { username: "Admin", role: "ADMIN", verified: true },
      { username: "Moderator", role: "MODERATOR", verified: true },
      { username: "User", role: "USER", verified: true },
    ]

    // Ensure data has length of at least 3 (migration with seeds work)
    expect(response.length).toBeGreaterThan(3)
    expectTypeOf(response).toEqualTypeOf<UserList[]>()

    // Expect all listed elements
    expectedStructure.forEach((expectedItem) => {
      expect(response).toContainEqual(expect.objectContaining(expectedItem))
    })
    response.forEach((item) => {
      // Expect a UUID for each item
      expect(item).toHaveProperty("id")
      // Expect the list items to have a name
      expect(item).toHaveProperty("username")
      // Expect the list items to have a role
      expect(item).toHaveProperty("role")
      expect(item.id).toMatch(
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
      )
      expect(item).toHaveProperty("verified")
    })
  })

  it("Should return users with correct roles", async () => {
    const response = await $fetch("/api/users")
    response.forEach((item) => {
      expect(["USER", "MODERATOR", "ADMIN"]).toContain(item.role)
    })
  })

  it("Should return users with verified status as a boolean", async () => {
    const response = await $fetch("/api/users")
    response.forEach((item) => {
      expect([true, false]).toContain(item.verified)
    })
  })
})
