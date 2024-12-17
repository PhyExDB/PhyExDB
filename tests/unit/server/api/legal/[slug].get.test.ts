import { describe, expect, expectTypeOf, it, vi } from "vitest"
import type { H3Event, EventHandlerRequest } from "h3"
import { v4 as uuidv4 } from "uuid"
import getLegalDocument from "~~/server/api/legal/[slug].get"
import { legalDocumentResultExtensions } from "~~/server/db/models/legalDocument"

describe("Api Route GET /api/legal/{slug}", () => {
  ["slug", "id of"].forEach((param) => {
    it.each([
      { slug: "privacy-policy" },
      { slug: "terms-of-service" },
      { slug: "imprint" },
    ])(`should return a detail of a legal document when getting by ${param} $slug`, async ({ slug }) => {
      const document = {
        id: uuidv4(),
        slug: slug,
        name: "Legal Document name",
        text: "This is the legal document text",
        toDetail: () => legalDocumentResultExtensions.toDetail.compute(document)(),
      }
      prisma.legalDocument.findFirst = vi.fn().mockImplementation(({ where }) => {
        if (where.id === document.id || where.slug === document.slug) {
          return Promise.resolve(document)
        }
        return Promise.resolve(null)
      })

      // Create mock event
      const event = {
        context: {
          params: {
            slug: param === "slug" ? document.slug : document.id,
          },
        },
      } as unknown as H3Event<EventHandlerRequest>

      const response = await getLegalDocument(event)

      expectTypeOf(response).toEqualTypeOf<LegalDocumentDetail>()
      const { toDetail, ...rest } = document
      expect(response).toStrictEqual({ ...rest })
    })
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

    await expect(getLegalDocument(event)).rejects.toMatchObject({
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

    await expect(getLegalDocument(event)).rejects.toMatchObject({
      message: "Invalid slug",
      statusCode: 400,
    })
  })
})
