import { describe, expect, expectTypeOf, it, vi } from "vitest"
import { v4 as uuidv4 } from "uuid"
import { generateMock } from "@anatine/zod-mock"
import endpoint from "~~/server/api/legal/[slug].put"
import { mockUser, user } from "~~/tests/helpers/auth"
import {
  getEvent,
  mockPrismaForPostSlugOrId,
  forSlugAndId,
  testSlugFails,
  testZodFailWithEmptyBody,
} from "~~/tests/helpers/utils"

describe("Api Route PUT /api/legal/{slug}", () => {
  // definitions
  const body = generateMock(legalDocumentUpdateSchema)

  const data = {
    id: uuidv4(),
    slug: "legal-document",
    name: "Legal Document name",
    text: "This is the legal document text",
  }
  const expected = { ...data, ...body }

  // mock
  mockUser(user.admin)
  mockPrismaForPostSlugOrId("legalDocument", data, expected)

  // tests
  testSlugFails(body, endpoint)
  testZodFailWithEmptyBody(data, endpoint)

  it(`should_succeed`, async () => {
    forSlugAndId(data, async (params) => {
      const event = getEvent({ params, body })

      const response = await endpoint(event)
      expectTypeOf(response).toEqualTypeOf<typeof expected>()
      expect(response).toStrictEqual(expected)
    })
  })
})
