import { describe, expectTypeOf } from "vitest"
import { v4 as uuidv4 } from "uuid"
import { mockUser, user } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/legal/[slug].get"

describe("Api Route GET /api/legal/{slug}", () => {
  // definitions
  const body = {}

  const data = {
    id: uuidv4(),
    slug: "legal-document",
    name: "Legal Document name",
    text: "This is the legal document text",
  }
  const expected: LegalDocumentDetail = data

  // mocks
  mockUser(user.guest)
  u.mockPrismaForSlugOrId("GET", "legalDocument", data, expected)

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccessWithSlugAndId(data, body, endpoint, expected)

    u.testSlugFails(body, endpoint)
  }
})
