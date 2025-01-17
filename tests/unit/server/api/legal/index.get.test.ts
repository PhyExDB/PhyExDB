import { describe, expect, expectTypeOf, it, vi } from "vitest"
import type { H3Event, EventHandlerRequest } from "h3"
import { v4 as uuidv4 } from "uuid"
import listLegalDocuments from "~~/server/api/legal/index.get"

describe("Api Route GET /api/legal", async () => {
  it("should return a list of legal documents", async () => {
    const privacyPolicy = {
      id: uuidv4(),
      slug: "privacy-policy",
      name: "Privacy Policy",
    }
    const termsOfService = {
      id: uuidv4(),
      slug: "terms-of-service",
      name: "Terms of Service",
    }
    const imprint = {
      id: uuidv4(),
      slug: "imprint",
      name: "Imprint",
    }
    const documents = [
      privacyPolicy,
      termsOfService,
      imprint,
    ]

    prisma.legalDocument.findMany = vi.fn().mockResolvedValue(documents)

    const event = {} as unknown as H3Event<EventHandlerRequest>

    const response = await listLegalDocuments(event)

    expectTypeOf(response).toEqualTypeOf<LegalDocumentList[]>()
    expect(response).toStrictEqual(documents)
  })
})
