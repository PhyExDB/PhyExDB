import { describe, expect, expectTypeOf, it } from "vitest"
import { setup, $fetch, url } from "@nuxt/test-utils/e2e"
import { v4 as uuidv4 } from "uuid"
import prisma from "../../../../../server/utils/prisma"

describe("Api Route PUT /api/legal/{slug}", async () => {
  await setup()

  it.each([
    { slug: "privacy-policy" },
    { slug: "terms-of-service" },
    { slug: "imprint" },
  ])("should return the updated detail of the legal document with slug $slug", async ({ slug }) => {
    const updateContent = {
      name: `New name ${uuidv4()}`,
      text: `New content ${uuidv4()}`,
    }

    const response = await $fetch(`/api/legal/${slug}`, {
      method: "PUT",
      body: JSON.stringify(updateContent),
    })

    expectTypeOf(response).toEqualTypeOf<LegalDocumentDetail>()
  })

  it.each([
    { slug: "privacy-policy" },
    { slug: "terms-of-service" },
    { slug: "imprint" },
  ])("should return the updated detail of the legal document with slug $slug when getting by id", async ({ slug }) => {
    const updateContent = {
      name: `New name ${uuidv4()}`,
      text: `New content ${uuidv4()}`,
    }

    const id = (await prisma.legalDocument.findFirst({ where: { slug: slug } }))!.id
    const response = await $fetch(`/api/legal/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateContent),
    })

    expectTypeOf(response).toEqualTypeOf<LegalDocumentDetail>()
    expect(response).toMatchObject(updateContent)
  })

  it.each(["name", "text"])("should return an error when the field %s is empty", async (field) => {
    const updateContent = {
      name: `New name ${uuidv4()}`,
      text: `New content ${uuidv4()}`,
    }
    if (field === "name") {
      updateContent.name = ""
    } else if (field === "text") {
      updateContent.text = ""
    }

    const response = await fetch(url("/api/legal/imprint"), {
      method: "PUT",
      body: JSON.stringify(updateContent),
    })

    expect(response.status).toBe(400)
  })

  it("should return an error when an unknown slug is passed", async () => {
    const response = await fetch(url("/api/legal/somethingwrong"), {
      method: "PUT",
    })

    expect(response.status).toBe(404)
  })
})
