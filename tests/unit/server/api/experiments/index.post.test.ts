import { describe, expectTypeOf, vi } from "vitest"
import { detail, detailDb } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/index.post"

describe("Api Route /api/experiments/index.post", () => {
  // definitions
  const data = undefined
  const expected = detail

  const context = u.getTestContext({
    data, expected, endpoint,

    user: users.user,
  })

  // mocks
  u.mockPrismaForPost({ ...context, expected: detailDb }, "experiment")
  vi.stubGlobal("$fetch", async (_: string) => {
    return []
  })

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccess(context)

    // needs to be last, because it changes the user mock
    u.testAuthFail(context, [users.guest, users.unverified])
  }
})
