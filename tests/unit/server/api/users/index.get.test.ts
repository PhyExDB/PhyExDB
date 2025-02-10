import { describe, expectTypeOf } from "vitest"
import { lists } from "./data"
import { mockUser, users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/users/index.get"

describe("Api Route GET /api/users/index", () => {
  // definitions
  const data = lists
  const expected = u.page(data)

  const context = u.getTestContext({
    data, expected, endpoint,
  })

  // mocks
  mockUser(users.admin)
  u.mockPrismaForGetAll(context, "user")

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccessWithPagination(context)
  }
})
