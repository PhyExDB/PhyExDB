import { describe, expect, it, vi } from "vitest"
import { setup, $fetch } from "@nuxt/test-utils/e2e"
import User from "~~/server/database/models/User"

describe("Api Route /api/users", async () => {
  await setup()

  it("Should return a list of users", async () => {
    const response = await $fetch("/api/users")
    // Expected output structure
    const expectedStructure = [
      { username: "Alice", role: "Administrator", verified: true },
      { username: "Bob", role: "Moderator", verified: true },
      { username: "Eve", role: "User", verified: true },
    ]

    // Ensure data has same length
    expect(response).toHaveLength(expectedStructure.length)

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

  it("Should return an empty list if no users exist", async () => {
    // Mock the User model to return an empty array
    // User.findAll = vi.fn().mockResolvedValue([])
    const _spy = vi.spyOn(User, "findAll").mockReturnValue([])
    const response = await $fetch("/api/users")
    expect(response).toEqual([])
    vi.resetAllMocks()
  })

  it("Should return users with correct roles", async () => {
    const response = await $fetch("/api/users")
    response.forEach((item) => {
      expect(["User", "Moderator", "Administrator"]).toContain(item.role)
    })
  })

  it("Should return users with verified status as a boolean", async () => {
    const response = await $fetch("/api/users")
    response.forEach((item) => {
      expect([true, false]).toContain(item.verified)
    })
  })

  it("Mock faulty response", async () => {
    // Mock the User model to throw an error
    const _spy = vi.spyOn(User, "findAll").mockResolvedValue([])
    const response = await $fetch("/api/users")
    expect(response).toEqual({ error: "Database error" })
  })
})
