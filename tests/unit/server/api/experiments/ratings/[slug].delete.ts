import { describe, expectTypeOf } from "vitest"
import { experiment, rating } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/ratings/[slug].delete"

describe("Api Route /api/experiments/ratings/[slug].delete", () => {
  // definitions
  const data = rating
  /* eslint-disable @typescript-eslint/no-invalid-void-type */
  const expected: void = undefined

  const context = u.getTestContext({
    data, expected, endpoint,

    params: { slug: experiment.slug },
    user: users.user,
  })

  // mocks
  u.mockPrismaForSlugOrIdGet({ data: experiment }, "experiment")
  u.mockPrismaForDelete(context, "rating",
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
