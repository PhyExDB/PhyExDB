import { describe, expect, expectTypeOf, it } from "vitest"
import { v4 as uuidv4 } from "uuid"
import { generateMock } from "@anatine/zod-mock"
import endpoint from "~~/server/api/legal/[slug].put"
import { mockUser, user } from "~~/tests/helpers/auth"
import {
  getEvent,
  mockPrismaForPutSlugOrId,
  forSlugAndIdEvent,
  testSlugFails,
  testZodFailMessage,
  testAuthFail,
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

  const params = { slug: data.slug }  
  const event = getEvent({ params, body })

  // mocks
  mockUser(user.admin)
  mockPrismaForPutSlugOrId("legalDocument", data, expected)

  // tests
  {
    it(`should_succeed`, async () => {
      forSlugAndIdEvent(data, body, async (event) => {
        const response = await endpoint(event)
        expectTypeOf(response).toEqualTypeOf<typeof expected>()
        expect(response).toStrictEqual(expected)
      })
    })

    testSlugFails(body, endpoint)
    testZodFailMessage(params, endpoint, [
      {
        body: { name: "a", text: "" },
        message: "Please enter some content",
      },
      {
        body: { name: "", text: "a" },
        message: "Please enter a name",
      },
    ])
    // needs to be last, because it changes the user mock
    testAuthFail(event, endpoint, [user.guest, user.user])
  }
})
