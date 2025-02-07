import { describe, expectTypeOf } from "vitest"
import { mockUser, users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import { lists } from "./data"
import endpoint from "~~/server/api/users/index.get"

describe("Api Route GET /api/users/index", () => {
  // definitions
  const body = {}
  const params = {}
  const query = {}

  const data = lists
  const expected = u.page(data)

  const context = {
    data,
    expected,
    endpoint,

    body,
    params,
    query,
  }

  // mocks
  mockUser(users.admin)
  u.mockPrismaForGetAll("user", data, expected)

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccessWithPagination(context)
  }
})
