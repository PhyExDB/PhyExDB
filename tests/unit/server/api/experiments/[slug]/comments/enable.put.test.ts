import { describe, expectTypeOf } from "vitest"
import { generateMock } from "@anatine/zod-mock"
import { experiment } from "./data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/[slug]/comments/enable.put"

describe("Api Route api/experiments/[slug]/comments/enable.put", () => {
  // definitions
  const body = generateMock(experimentCommentEnabledSchema)

  const data = experiment
  const updatedExperiment = { ...experiment, ...body }
  const expected = body

  const context = u.getTestContext({
    data, expected, endpoint,

    params: { slug: experiment.slug },
    body,
    user: users.user,
  })

  // mocks
  u.mockPrismaForSlugOrIdPut({ data: experiment, expected: updatedExperiment }, "experiment")

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
