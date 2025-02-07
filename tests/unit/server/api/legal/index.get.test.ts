import { describe, expectTypeOf } from "vitest"
import { lists } from "./data"
import { mockUser, users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/legal/index.get"

describe("Api Route GET /api/legal/index", () => {
  // definitions
  const body = {}
  const params = {}
  const query = {}

  const data = lists
  const expected = data

  const context = {
    data,
    expected,
    endpoint,

    body,
    params,
    query,
  }

  // mocks
  mockUser(users.guest)
  u.mockPrismaForGetAll("legalDocument", data, expected)

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccess(context)
  }
})
