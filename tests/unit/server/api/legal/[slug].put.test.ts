import { describe, expectTypeOf } from "vitest"
import { v4 as uuidv4 } from "uuid"
import { generateMock } from "@anatine/zod-mock"
import { mockUser, user } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/legal/[slug].put"

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
  const event = u.getEvent({ params, body })

  // mocks
  mockUser(user.admin)
  u.mockPrismaForSlugOrIdPut("legalDocument", data, expected)

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccessWithSlugAndId(data, body, endpoint, expected)

    u.testSlugFails(body, endpoint)
    u.testZodFailMessage(params, endpoint, [
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
    u.testAuthFail(event, endpoint, [user.guest, user.user])
  }
})
