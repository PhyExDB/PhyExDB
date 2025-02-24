import { describe, expectTypeOf } from "vitest"
import { startpage } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/startpage/index.put"

describe("Api Route PUT /api/startpage/index", () => {
  // definitions
  const body = {
    text: "new startpage",
    description: "new description",
    files: [],
  }

  const data = startpage
  const expected = { ...data, ...body }

  const context = u.getTestContext({
    data, expected, endpoint,

    body: body,
    user: users.admin,
  })

  // mocks
  u.mockPrismaForPut(context, "startpage", () => true)

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccess(context)
    u.testZodFail(context, [
      {
        body: {},
      },
    ])
    // needs to be last, because it changes the user mock
    u.testAuthFail(context, [users.guest, users.user, users.mod])
  }
})
