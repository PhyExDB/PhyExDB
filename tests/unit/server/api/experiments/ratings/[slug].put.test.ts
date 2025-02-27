import { describe, expectTypeOf } from "vitest"
import { generateMock } from "@anatine/zod-mock"
import { experiment, rating } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/ratings/[slug].put"

describe("Api Route api/experiments/ratings/[slug].put", () => {
  // definitions
  const body = generateMock(experimentRatingSchema)

  const data = rating
  const expected = { ...data, ...body }

  const context = u.getTestContext({
    data, expected, endpoint,

    params: { slug: experiment.slug },
    body,
    user: users.user,
  })

  // mocks
  u.mockPrismaForSlugOrIdPut({ data: experiment, expected: experiment }, "experiment")
  u.mockPrismaForPut(context, "rating",
    (where: { compoundId?: { experimentId?: string, userId?: string } }) =>
      where.compoundId?.experimentId === experiment.id
      && where.compoundId?.userId === context.user.id,
  )

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccess(context)

    u.testZodFail(context, [
      {
        body: { },
      },
    ])
    // needs to be last, because it changes the user mock
    u.testAuthFail(context, [users.guest, users.unverified])
  }
})
