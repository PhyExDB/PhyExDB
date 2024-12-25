import { describe, expect, expectTypeOf, it } from "vitest"
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
    expectTypeOf(response).toEqualTypeOf<LegalDocumentList[]>()
  })
})
