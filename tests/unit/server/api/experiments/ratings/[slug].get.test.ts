import { describe, expectTypeOf } from "vitest"
import { experiment, rating } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/ratings/[slug].get"

describe("Api Route /api/experiments/ratings/[slug].get", () => {
  // definitions
  const data = rating
  const expected = data

  const context = u.getTestContext({
    data, expected, endpoint,

    params: { slug: experiment.slug },
    user: users.user,
  })

  // mocks
  u.mockPrismaForSlugOrIdGet({ data: experiment }, "experiment")
  u.mockPrismaForGet(context, "rating",
    (where: { compoundId?: { experimentId?: string, userId?: string } }) =>
      where.compoundId?.experimentId === experiment.id
      && where.compoundId?.userId === context.user.id,
  )

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccess(context)

    u.testAuthFail(context, [users.guest, users.unverified])
  }
})
