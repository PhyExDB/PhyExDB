import { describe, expect, it } from "vitest"
import { setup, $fetch } from "@nuxt/test-utils/e2e"

describe("Api Route /api/legal", async () => {
  await setup()

  it("should return a list of legal documents", async () => {
    const response = await $fetch("/api/legal")

    // Expected output structure without `id`
    const expectedStructure = [
      { slug: "privacy-policy" },
      { slug: "terms-of-service" },
      { slug: "imprint" },
    ]

    // Ensure data has the same length
    expect(response).toHaveLength(expectedStructure.length)
    // Expect all listed elements
    expectedStructure.forEach((expectedItem) => {
      expect(response).toContainEqual(expect.objectContaining(expectedItem))
    })
    response.forEach((item) => {
      // Expect the list items to have a name
      expect(item).toHaveProperty("name")
      // Expect the list items to not have a content field
      expect(item).not.toHaveProperty("content")
      // Expect a UUID for each item
      expect(item).toHaveProperty("id")
      expect(item.id).toMatch(
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
      )
    })
  })
})
