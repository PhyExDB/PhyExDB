import { describe, expectTypeOf } from "vitest"
import { lists } from "./data"
import { mockUser, users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/sections/index.get"

describe("Api Route /api/experiments/sections/index.get", () => {
  // definitions
  const data = lists
  const expected = data

  const context = u.getTestContext({
    data, expected, endpoint,
  })

  // mocks
  mockUser(users.guest)
  u.mockPrismaForGetAll(context, "experimentSection")

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccess(context)
  }
})
