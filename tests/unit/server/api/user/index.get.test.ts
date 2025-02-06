import { describe, expectTypeOf } from "vitest"
import { lists } from "./data"
import { mockUser, users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/users/index.get"

describe("Api Route GET /api/users/index", () => {
  // definitions
  const body = {}
  const params = {}

  const data = lists
  const expected = u.page(data)

  const event = u.getEvent({ body })

  // mocks
  mockUser(users.admin)
  u.mockPrismaForGetAll("user", data, expected)

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccessWithPagination(data, params, body, endpoint, expected)
  }
})
