import { describe, expectTypeOf } from "vitest"
import { mockUser, user } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"
import { lists } from "./data"

import endpoint from "~~/server/api/legal/index.get"

describe("Api Route GET /api/legal/index", () => {
  // definitions
  const body = {}

  const data = lists
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
