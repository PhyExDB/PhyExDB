import { describe, expect, it } from "vitest"
import { setup, $fetch, url } from "@nuxt/test-utils/e2e"
import Legal from "~~/server/database/models/Legal"

describe("Api Route /api/legal/{slug}", async () => {
  await setup()

  it.each([
    { slug: "privacy-policy" },
    { slug: "terms-of-service" },
    { slug: "imprint" },
  ])("should return a detail of a legal document when getting by slug $slug", async ({ slug }) => {
    const response = await $fetch(`/api/legal/${slug}`)

    // Expect the slug to be present
    expect(response).toHaveProperty("slug")
    expect(response.slug).toBe(slug)

    // Expect a name
    expect(response).toHaveProperty("name")

    // Expect a UUID
    expect(response).toHaveProperty("id")
    expect(response.id).toMatch(
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    )

    // Expect a content field
    expect(response).toHaveProperty("content")
  })

  it.each([
    { slug: "privacy-policy" },
    { slug: "terms-of-service" },
    { slug: "imprint" },
  ])("should return a detail of a legal document when getting by id of $slug", async ({ slug }) => {
    const id = (await Legal.findOne({ where: { slug: slug } }))!.id
    const response = await $fetch(`/api/legal/${id}`)

    // Expect the slug to be present
    expect(response).toHaveProperty("slug")
    expect(response.slug).toBe(slug)

    // Expect a name
    expect(response).toHaveProperty("name")

    // Expect a UUID
    expect(response).toHaveProperty("id")
    expect(response.id).toBe(id)

    // Expect a content field
    expect(response).toHaveProperty("content")
  })

  it("should return an error when an unknown slug is passed", async () => {
    const response = await fetch(url("/api/legal/somethingwrong"))

    expect(response.status).toBe(404)
  })
})
