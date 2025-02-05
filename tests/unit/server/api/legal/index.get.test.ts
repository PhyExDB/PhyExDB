import { describe, expectTypeOf } from "vitest"
import { v4 as uuidv4 } from "uuid"
import { mockUser, user } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/legal/index.get"

describe("Api Route GET /api/legal/index", () => {
  // definitions
  const body = {}

  const data = [
    {
      id: uuidv4(),
      slug: "privacy-policy",
      name: "Privacy Policy",
    },
    {
      id: uuidv4(),
      slug: "terms-of-service",
      name: "Terms of Service",
    },
    {
      id: uuidv4(),
      slug: "imprint",
      name: "Imprint",
    },
  ]
  const expected = data

  const event = u.getEvent({ body })

  // mocks
  mockUser(user.guest)
  u.mockPrismaForGetAll("legalDocument", data, expected)

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccess(event, endpoint, expected)
  }
})
