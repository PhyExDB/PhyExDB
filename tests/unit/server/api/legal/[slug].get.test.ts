import { describe, expectTypeOf } from "vitest"
import { detail } from "./data"
import { mockUser, users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/legal/[slug].get"

describe("Api Route GET /api/legal/{slug}", () => {
  // definitions
  const body = {}

  const data = detail
  const expected = data

  // mocks
  mockUser(users.guest)
  u.mockPrismaForSlugOrIdGet("legalDocument", data, expected)

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccessWithSlugAndId(data, body, endpoint, expected)

    u.testSlugFails(body, endpoint)
  }
})
