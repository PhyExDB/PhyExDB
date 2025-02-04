import { describe, expect, expectTypeOf, it, vi } from "vitest"
import { v4 as uuidv4 } from "uuid"
import updateLegalDocument from "~~/server/api/legal/[slug].put"
import { mockUser, user } from "~~/tests/helpers/auth"
import {
  getEvent,
  mockPrismaForPostSlugOrId,
  forSlugAndId,
} from "~~/tests/helpers/utils"
import { generateMock } from "@anatine/zod-mock"


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

  it(`should_succeed`, async () => {  
    forSlugAndId(data, async (params) => {
      const event = getEvent({ params, body })

      const response = await updateLegalDocument(event)
      expectTypeOf(response).toEqualTypeOf<typeof expected>()
      expect(response).toStrictEqual(expected)
    })
  })

  it(`should_fail_zod`, async () => {
    const body = {}

    forSlugAndId(data, async (params) => {
      const event = getEvent({ params, body })

      await expect(updateLegalDocument(event)).rejects.toThrowError(
        expect.objectContaining({
          name: "ZodError",
        }),
      )
    })
  })

  it ("should_fail_when_unknown_slug", async () => {
    forSlugAndId({ id: uuidv4(), slug: "unknow-slug"}, async (params) => {
      const event = getEvent({ params, body })

      await expect(updateLegalDocument(event)).rejects.toThrowError(
        expect.objectContaining({
          statusCode: 404,
        }),
      )
    })
  })

  it("should_fail_when_no_slug", async () => {
    const event = getEvent({ body })

    await expect(updateLegalDocument(event)).rejects.toMatchObject({
      message: "Invalid slug",
      statusCode: 400,
    })
  })

})
