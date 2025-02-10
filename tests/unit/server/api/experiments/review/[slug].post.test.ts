import { describe, expectTypeOf, it } from "vitest"
import { generateMock } from "@anatine/zod-mock"
import { detail, detailDb } from "../data"
import { users } from "~~/tests/helpers/auth"
import type { EndpointResult } from "~~/tests/helpers/utils"
import * as u from "~~/tests/helpers/utils"

import endpoint from "~~/server/api/experiments/review/[slug].post"

describe("Api Route PUT /api/experiments/review/[slug].post", () => {
  // definitions
  const body = generateMock(experimentReviewSchema)

  const data = {
    ...detailDb,
    status: "IN_REVIEW",
  }
  /* eslint-disable @typescript-eslint/no-invalid-void-type */
  const expected: void = undefined

  const context = u.getTestContext({
    data, expected, endpoint,

    body: body,
    params: { slug: data.slug },
    user: users.mod,
  })

  // mocks
  u.mockPrismaForSlugOrIdPut({ data: data, expected: data }, "experiment")

  // tests
  {
    // type test
    expectTypeOf<EndpointResult<typeof endpoint>>().toEqualTypeOf<typeof expected>()

    u.testSuccessWithSlugAndId(context)

    u.testSlugFails(context)
    u.testZodFail(context, [
      {
        body: { },
      },
    ])
    u.testAuthFail(context, [users.guest, users.user])
    // needs to be last, because it changes the user mock
    it("should_fail_when_not_in_review", async () => {
      u.mockPrismaForSlugOrIdPut({ data: { ...data, status: "DRAFT" }, expected: data }, "experiment")
      await u.expectErrorObjectMatching(context, { message: "Experiment is not in review!" })
    })
  }
})
