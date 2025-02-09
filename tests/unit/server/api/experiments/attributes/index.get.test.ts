import { describe, expectTypeOf } from "vitest"
import { lists } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/attributes/index.get"

describe("Api Route /api/experiments/attributes/index.get", () => {
  // definitions
  const data = lists
  const expected = data

  const context = u.getTestContext({
    data, expected, endpoint,

    user: users.guest
  })

  // mocks
  u.mockPrismaForGetAll(context, "experimentAttribute")

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccess(context)
  }
})
