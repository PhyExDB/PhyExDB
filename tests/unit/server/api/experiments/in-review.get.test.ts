import { describe, expectTypeOf } from "vitest"
import { lists, listsDb } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/in-review.get"

describe("Api Route /api/experiments/in-review.get", () => {
  // definitions
  const data = listsDb
  const listsWithReviewCount = lists.map(exp => ({
    ...exp,
    completedReviewsCount: 0,
  }))
  const expected = u.page(listsWithReviewCount)

  const context = u.getTestContext({
    data, expected, endpoint,

    user: users.mod,
  })

  // mocks
  u.mockPrismaForGetAll(context, "experiment")

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccessWithPagination(context, listsWithReviewCount)

    u.testAuthFail(context, [users.guest, users.user])
  }
})
