import { describe, expect, expectTypeOf, it, vi } from "vitest"
import type { H3Event, EventHandlerRequest } from "h3"
import { v4 as uuidv4 } from "uuid"
import updateLegalDocument from "~~/server/api/legal/[slug].put"

describe("Api Route PUT /api/legal/{slug}", () => {
  ["slug", "id of"].forEach((param) => {
    it.each([
      { slug: "privacy-policy" },
      { slug: "terms-of-service" },
      { slug: "imprint" },
    ])(`should return the updated detail of the legal document with ${param} $slug`, async ({ slug }) => {
      const updateContent = {
        name: `New name ${uuidv4()}`,
        text: `New content ${uuidv4()}`,
      }

      const document = {
        id: uuidv4(),
        slug: slug,
        name: "Legal Document name",
        text: "This is the legal document text",
      }

      const getter = vi.fn().mockImplementation(({ where }) => {
        if (where.id === document.id || where.slug === document.slug) {
          return Promise.resolve(document)
        }
        return Promise.resolve(null)
      })

      prisma.legalDocument.findFirst = getter
      prisma.legalDocument.update = getter

      // Create mock event
      const event = {
        context: {
          params: {
            slug: slug,
            body: updateContent,
          },
        },
        body: updateContent,
      } as unknown as H3Event<EventHandlerRequest>

      const response = await updateLegalDocument(event)

      expectTypeOf(response).toEqualTypeOf<LegalDocumentDetail>()
      expect(response).toStrictEqual(document)
    })
  })

  it.each([
    { value: "name", description: "a name" },
    { value: "text", description: "some content" },
  ])(`should return an error when the field $value empty`, async ({ value, description }) => {
    const updateContent = {
      name: "New name",
      text: "New content",
    }
    if (value === "name") {
      updateContent.name = ""
    } else if (value === "text") {
      updateContent.text = ""
    }

    const event = {
      context: {
        params: {
          slug: "privacy-policy",
        },
      },
      body: updateContent,
    } as unknown as H3Event<EventHandlerRequest>

    const document = {
      id: uuidv4(),
      slug: "privacy-policy",
      name: "Legal Document name",
      text: "This is the legal document text",
    }

    const getter = vi.fn().mockImplementation(({ where }) => {
      if (where.id === document.id || where.slug === document.slug) {
        return Promise.resolve(document)
      }
      return Promise.resolve(null)
    })

    prisma.legalDocument.findFirst = getter
    prisma.legalDocument.update = getter

    await expect(updateLegalDocument(event)).rejects.toThrowError(
      expect.objectContaining({
        message: expect.stringContaining(`Please enter ${description}`),
      }),
    )
  })

  it ("should return an error when an unknown slug is passed", async () => {
    prisma.legalDocument.findFirst = vi.fn().mockResolvedValue(null)

    const event = {
      context: {
        params: {
          slug: uuidv4(),
        },
      },
    } as unknown as H3Event<EventHandlerRequest>

    await expect(updateLegalDocument(event)).rejects.toMatchObject({
      message: "Document not found",
      statusCode: 404,
    })
  })

  it("should return an error when no slug is passed", async () => {
    const event = {
      context: {
        params: {},
      },
    } as unknown as H3Event<EventHandlerRequest>

    await expect(updateLegalDocument(event)).rejects.toMatchObject({
      message: "Invalid slug",
      statusCode: 400,
    })
  })
})
