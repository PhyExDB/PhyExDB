import { describe, expectTypeOf, vi } from "vitest"
import { detailDb } from "../data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/delete/[id].delete"

describe("Api Route /api/experiments/delete/[id].delete", () => {
  // definitions
  const data = detailDb
  /* eslint-disable @typescript-eslint/no-invalid-void-type */
  const expected: void = undefined

  const context = u.getTestContext({
    data, expected, endpoint,

    params: { id: data.id },
    user: users.user,
  })

  // mocks
  u.mockPrismaForIdDelete(context, "experiment")

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccess(context)

    u.testIdFails(context)
    u.testAuthFail(context, [users.unverified, users.user2, users.mod])
  }
})
