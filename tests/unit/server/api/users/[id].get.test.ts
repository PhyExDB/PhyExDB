import { describe, expectTypeOf } from "vitest"
import { detail } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/users/[id].get"

describe("Api Route GET /api/users/{id}", () => {
  // definitions
  const data = detail
  const expected = data

  const context = u.getTestContext({
    data, expected, endpoint,

    params: { id: data.id },
    user: users.admin
  })

  // mocks
  u.mockPrismaForIdGet(context, "user")

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccess(context)

    u.testIdFails(context)
    u.testAuthFail(context, [
      users.guest,
      users.user,
      users.mod,
    ])
  }
})
