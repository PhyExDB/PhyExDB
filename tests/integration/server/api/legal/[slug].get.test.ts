import { describe, expect, expectTypeOf, it } from "vitest"
import { setup, $fetch, url } from "@nuxt/test-utils/e2e"
import prisma from "../../../../../server/utils/prisma"

describe("Api Route /api/legal/{slug}", async () => {
  await setup()

  it.each([
    { slug: "privacy-policy" },
    { slug: "terms-of-service" },
    { slug: "imprint" },
  ])("should return a detail of a legal document when getting by slug or id of $slug", async ({ slug }) => {
    const slugResponse = await $fetch(`/api/legal/${slug}`)
    expectTypeOf(slugResponse).toEqualTypeOf<LegalDocumentDetail>()

    const id = (await prisma.legalDocument.findFirst({ where: { slug: slug } }))!.id
    const idResponse = await $fetch(`/api/legal/${id}`)
    expectTypeOf(idResponse).toEqualTypeOf<LegalDocumentDetail>()
  })

  it("should return an error when an unknown slug is passed", async () => {
    const response = await fetch(url("/api/legal/somethingwrong"))

    expect(response.status).toBe(404)
  })
})
